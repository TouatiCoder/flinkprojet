<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Throwable;

class ConvertUserAndEtabController extends Controller
{
    private function mapObjectiveToInteretId(string $objective): int
    {
        switch ($objective) {
            case 'compte_pro':
                return 2;
            case 'solde_ads':
                return 3;
            case 'renouvellement_pro':
                return 4;
            case 'devenir_user':
            default:
                return 1;
        }
    }


    public function userConvert(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id'              => 'required|integer|exists:users,id',
            'objectives'           => 'required|array|min:1',
            'objectives.*'         => 'string',
            'solde_compte_pro'     => 'nullable|numeric|min:0',
            'solde_ads'            => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $userId = (int)$request->input('user_id');
            $now = Carbon::now();

            $managerRelation = DB::table('manager_users_users')
                ->where('user_id', $userId)
                ->first();
                
            $managerId = null;
            if ($managerRelation) {
                $managerId = $managerRelation->manager_users_id 
                    ?? $managerRelation->manager_user_id 
                    ?? $managerRelation->manager_id 
                    ?? null;
            }

            $firstActivite = DB::table('ma_pipline_activites_types')->orderBy('id', 'asc')->first();
            $activiteTypeId = $firstActivite ? $firstActivite->id : 1;

            $soldesArray = [];
            $objectives = $request->input('objectives', []);

            if (in_array('compte_pro', $objectives)) {
                $soldesArray[] = [
                    'type'    => 'pro',
                    'label'   => 'Compte Pro',
                    'montant' => $request->filled('solde_compte_pro') ? (float)$request->input('solde_compte_pro') : 1000.0,
                ];
            }

            if (in_array('solde_ads', $objectives) && $request->filled('solde_ads')) {
                $soldesArray[] = [
                    'type'    => 'ads',
                    'label'   => 'Solde Ads',
                    'montant' => (float)$request->input('solde_ads'),
                ];
            }

            $firstPivotId = null;
            foreach ($objectives as $idx => $obj) {
                $interetId = $this->mapObjectiveToInteretId($obj);

                $pivotId = DB::table('prospect_prospect_interet')->insertGetId([
                    'prospect_id'         => null,
                    'user_id'             => $userId,
                    'prospect_interet_id' => $interetId,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);

                if ($idx === 0) {
                    $firstPivotId = $pivotId;
                }
            }

            $cardId = DB::table('ma_pipline_cards')->insertGetId([
                'type_user'                    => 'user',
                'soldes'                       => !empty($soldesArray) ? json_encode($soldesArray) : null,
                'position'                     => 0,
                'date_echeance'                => $now->toDateString(),
                'prospect_id'                  => null,
                'user_id'                      => $userId,
                'etablissement_id'             => null,
                'ma_pipline_etape_id'          => 1, // Nouveau
                'ma_pipline_activites_type_id' => $activiteTypeId,
                'manager_users_id'             => $managerId,
                'prospect_prospect_interet_id' => $firstPivotId,
                'created_at'                   => $now,
                'updated_at'                   => $now,
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Opportunité créée avec succès pour l’utilisateur',
                'data'    => [
                    'card_id' => $cardId,
                    'user_id' => $userId,
                ]
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la conversion',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }



    public function etabConvert(Request $request): JsonResponse
    {
        $rawEtabId = $request->input('etablissement_id') ?? $request->input('etab_id');
        $request->merge(['etablissement_id' => $rawEtabId]);

        $validator = Validator::make($request->all(), [
            'etablissement_id'      => 'required|integer',
            'objectives'            => 'required|array|min:1',
            'objectives.*'          => 'string',
            'solde_ads'             => 'nullable|numeric|min:0',
            'solde_renouvellement'  => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $etabId = (int)$request->input('etablissement_id');
            $now = Carbon::now();

            $etab = DB::table('etablissements')->where('id', $etabId)->first();
            $userId = null;
            if ($etab) {
                if (isset($etab->user_id)) {
                    $userId = $etab->user_id;
                } elseif (isset($etab->users_id)) {
                    $userId = $etab->users_id;
                }
            }

            $managerId = 1;

            $firstActivite = DB::table('ma_pipline_activites_types')->orderBy('id', 'asc')->first();
            $activiteTypeId = $firstActivite ? $firstActivite->id : 1;

            $soldesArray = [];
            $objectives = $request->input('objectives', []);

            if (in_array('solde_ads', $objectives) && $request->filled('solde_ads')) {
                $soldesArray[] = [
                    'type'    => 'ads',
                    'label'   => 'Solde Ads',
                    'montant' => (float)$request->input('solde_ads'),
                ];
            }

            if (in_array('renouvellement_pro', $objectives)) {
                $soldesArray[] = [
                    'type'    => 'renouvellement',
                    'label'   => 'Renouvellement Pro',
                    'montant' => $request->filled('solde_renouvellement') ? (float)$request->input('solde_renouvellement') : 1000.0,
                ];
            }

            $firstPivotId = null;
            if ($userId) {
                foreach ($objectives as $idx => $obj) {
                    $interetId = $this->mapObjectiveToInteretId($obj);

                    $pivotId = DB::table('prospect_prospect_interet')->insertGetId([
                        'prospect_id'         => null,
                        'user_id'             => $userId,
                        'prospect_interet_id' => $interetId,
                        'created_at'          => $now,
                        'updated_at'          => $now,
                    ]);

                    if ($idx === 0) {
                        $firstPivotId = $pivotId;
                    }
                }
            }

            $cardId = DB::table('ma_pipline_cards')->insertGetId([
                'type_user'                    => 'compte_pro',
                'soldes'                       => !empty($soldesArray) ? json_encode($soldesArray) : null,
                'position'                     => 0,
                'date_echeance'                => $now->toDateString(),
                'prospect_id'                  => null,
                'user_id'                      => $userId,
                'etablissement_id'             => $etabId,
                'ma_pipline_etape_id'          => 1,
                'ma_pipline_activites_type_id' => $activiteTypeId,
                'manager_users_id'             => $managerId,
                'prospect_prospect_interet_id' => $firstPivotId,
                'created_at'                   => $now,
                'updated_at'                   => $now,
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Opportunité créée avec succès pour l’établissement',
                'data'    => [
                    'card_id'          => $cardId,
                    'etablissement_id' => $etabId,
                    'user_id'          => $userId,
                    'manager_id'       => $managerId,
                ]
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la conversion',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }
}