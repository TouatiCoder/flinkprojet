<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Throwable;
use Illuminate\Support\Str;

class LpFlinkController extends Controller
{
    public function storeUserLp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name'           => 'required|string|max:255',
            'last_name'            => 'required|string|max:255',
            'email'                => 'required|email|max:255|unique:users,email',
            'tele'                 => 'nullable|string|max:50',
            'password'             => 'required|string|min:6',
            'activite_id'          => 'nullable|integer',
            'prospect_interet_ids' => 'nullable',
            'solde_compte_pro'     => 'nullable|numeric|min:0',
            'solde_ads'            => 'nullable|numeric|min:0',
            'manager_users_id'     => 'nullable|integer',
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

            $now = Carbon::now();
            $firstName = trim($request->input('first_name'));
            $lastName  = trim($request->input('last_name'));

            $baseSlug = Str::slug("{$firstName} {$lastName}");
            $slug = !empty($baseSlug) ? $baseSlug . '-' . rand(1000, 9999) : 'user-' . Str::random(8);

            $userId = DB::table('users')->insertGetId([
                'first_name'         => $firstName,
                'last_name'          => $lastName,
                'email'              => trim($request->input('email')),
                'tele'               => $request->input('tele') ? trim($request->input('tele')) : null,
                'password'           => Hash::make($request->input('password')),
                'activite_id'        => $request->input('activite_id'),
                'slug'               => $slug,
                'consommation_solde' => 0,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);

            $interetInput = $request->input('prospect_interet_ids');
            $firstPivotId = null;

            if (!empty($interetInput)) {
                $interetIds = is_array($interetInput) ? $interetInput : [$interetInput];
                $uniqueInteretIds = array_values(array_unique(array_filter($interetIds)));

                foreach ($uniqueInteretIds as $index => $interetId) {
                    $insertedPivotId = DB::table('prospect_prospect_interet')->insertGetId([
                        'user_id'             => $userId,
                        'prospect_id'         => null,
                        'prospect_interet_id' => (int) $interetId,
                        'created_at'          => $now,
                        'updated_at'          => $now,
                    ]);

                    if ($index === 0) {
                        $firstPivotId = $insertedPivotId;
                    }
                }
            } else {
                $firstPivotId = DB::table('prospect_prospect_interet')->insertGetId([
                    'user_id'             => $userId,
                    'prospect_id'         => null,
                    'prospect_interet_id' => 1,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);
            }

            $soldesArray = [];

            if ($request->filled('solde_compte_pro') && (float)$request->input('solde_compte_pro') > 0) {
                $soldesArray[] = [
                    'type'    => 'pro',
                    'label'   => 'Compte Pro',
                    'montant' => (float)$request->input('solde_compte_pro'),
                ];
            }

            if ($request->filled('solde_ads') && (float)$request->input('solde_ads') > 0) {
                $soldesArray[] = [
                    'type'    => 'ads',
                    'label'   => 'Solde Ads',
                    'montant' => (float)$request->input('solde_ads'),
                ];
            }

            $managerId = $request->input('manager_users_id');
            if (!$managerId) {
                $firstManager = DB::table('manager_users')->first();
                $managerId = $firstManager ? $firstManager->id : null;
            }

            $cardId = DB::table('ma_pipline_cards')->insertGetId([
                'type_user'                    => 'user',
                'soldes'                       => !empty($soldesArray) ? json_encode($soldesArray) : null,
                'position'                     => 0,
                'date_echeance'                => $now->toDateString(),
                'prospect_id'                  => null,
                'user_id'                      => $userId,
                'etablissement_id'             => null,
                'ma_pipline_etape_id'          => 1,
                'ma_pipline_activites_type_id' => 1,
                'manager_users_id'             => $managerId,
                'prospect_prospect_interet_id' => $firstPivotId,
                'created_at'                   => $now,
                'updated_at'                   => $now,
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Utilisateur LP créé avec succès et ajouté au Pipeline',
                'data'    => [
                    'user_id' => $userId,
                    'card_id' => $cardId,
                    'slug'    => $slug,
                ]
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de l\'enregistrement',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }
}