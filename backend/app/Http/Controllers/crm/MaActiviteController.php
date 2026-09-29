<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Throwable;

class MaActiviteController extends Controller
{

    public function getCurrentActivite(Request $request): JsonResponse
    {
        try {
            $cardId     = $request->query('card_id');
            $userId     = $request->query('user_id');
            $etabId     = $request->query('etab_id');
            $prospectId = $request->query('prospect_id');

            $cardQuery = DB::table('ma_pipline_cards');
            if (!empty($cardId)) {
                $cardQuery->where('id', $cardId);
            } elseif (!empty($userId)) {
                $cardQuery->where('user_id', $userId);
            } elseif (!empty($etabId)) {
                $cardQuery->where('etablissement_id', $etabId);
            } elseif (!empty($prospectId)) {
                $cardQuery->where('prospect_id', $prospectId);
            } else {
                return response()->json(['status' => 'error', 'message' => 'Entité non spécifiée'], 422);
            }

            $card = $cardQuery->first();
            if (!$card) {
                return response()->json(['status' => 'error', 'message' => 'Aucune opportunité trouvée'], 404);
            }

            $historiqueQuery = DB::table('ma_activites_historique');
            if (!empty($userId)) {
                $historiqueQuery->where('user_id', $userId);
            } elseif (!empty($etabId)) {
                $historiqueQuery->where('etab_id', $etabId);
            } elseif (!empty($prospectId)) {
                $historiqueQuery->where('prospect_id', $prospectId);
            }

            $lastHistorique = $historiqueQuery->orderBy('id', 'desc')->first();

            if ($lastHistorique && (int)$lastHistorique->need_planning === 1) {
                $allTypes = DB::table('ma_pipline_activites_types')->orderBy('id', 'asc')->get();

                return response()->json([
                    'status' => 'success',
                    'data'   => [
                        'card_id'            => $card->id,
                        'need_planning'      => true,
                        'all_activity_types' => $allTypes,
                        'last_historique_id' => $lastHistorique->id,
                        'server_time'        => Carbon::now()->format('H:i'),
                        'server_hour'        => Carbon::now()->format('H:i'),
                        'server_date'        => Carbon::now()->toDateString(),
                    ]
                ], 200);
            }

            $currentTypeId = $lastHistorique 
                ? (int)$lastHistorique->ma_pipline_activites_types_id 
                : ((int)($card->ma_pipline_activites_type_id ?? 1));

            $dateEcheanceStr = $lastHistorique ? $lastHistorique->date : ($card->date_echeance ?? null);
            $heureStr        = $lastHistorique ? $lastHistorique->heure : null;
            $notePlanif      = $lastHistorique ? $lastHistorique->note : null;

            $activiteType = DB::table('ma_pipline_activites_types')
                ->where('id', $currentTypeId)
                ->first();

            $notes = DB::table('ma_pipline_activites_notes')
                ->where('ma_pipline_activites_types_id', $currentTypeId)
                ->get();

            $today = Carbon::today();
            $dateEcheance = !empty($dateEcheanceStr) ? Carbon::parse($dateEcheanceStr) : null;
            $isRetard = false;
            $retardText = null;

            if ($dateEcheance) {
                if ($dateEcheance->lt($today)) {
                    $isRetard = true;
                    $diffDays = $dateEcheance->diffInDays($today);
                    $retardText = $diffDays == 0 ? "En retard d'aujourd'hui" : "En retard de {$diffDays} jour(s)";
                } elseif ($dateEcheance->isToday()) {
                    $retardText = "Prévu pour aujourd'hui";
                    if ($heureStr && Carbon::parse($dateEcheanceStr . ' ' . $heureStr)->lt(Carbon::now())) {
                        $isRetard = true;
                        $retardText = "En retard (heure dépassée)";
                    }
                } else {
                    $retardText = "Prévu le " . $dateEcheance->format('d/m/Y');
                }
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'card_id'               => $card->id,
                    'type_user'             => $card->type_user ?? null,
                    'date_echeance'         => $dateEcheanceStr,
                    'heure'                 => $heureStr,
                    'note_planification'    => $notePlanif,
                    'is_retard'             => $isRetard,
                    'retard_text'           => $retardText,
                    'need_planning'         => false,
                    'activite_actuelle'     => [
                        'id'    => $activiteType->id ?? 1,
                        'name'  => $activiteType->name ?? 'Appel',
                        'icone' => $activiteType->icone ?? 'phone',
                    ],
                    'notes'                 => $notes,
                ]
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération de l\'activité',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function storeActivite(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'card_id'                       => 'nullable|integer',
            'user_id'                       => 'nullable|integer',
            'etab_id'                       => 'nullable|integer',
            'prospect_id'                   => 'nullable|integer',
            'ma_pipline_activites_types_id' => 'required|integer',
            'ma_pipline_activites_notes_id' => 'required|integer',
            'note'                          => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $now = Carbon::now();
            $managerUser = auth('sanctum')->user() ?? auth()->user() ?? $request->user();
            $managerId = $managerUser ? ($managerUser->id ?? null) : $request->input('manager_users_id');

            $createdById = $managerUser ? $managerUser->id : null;

            $insertedId = DB::table('ma_activites_historique')->insertGetId([
                'user_id'                       => $request->input('user_id'),
                'etab_id'                       => $request->input('etab_id'),
                'prospect_id'                   => $request->input('prospect_id'),
                'ma_pipline_activites_types_id' => $request->input('ma_pipline_activites_types_id'),
                'ma_pipline_activites_notes_id' => $request->input('ma_pipline_activites_notes_id'),
                'date'                          => $now->toDateString(),
                'heure'                         => $now->toTimeString(),
                'note'                          => $request->input('note'),
                'manager_users_id'              => $managerId,
                'created_by_id'                 => $createdById,
                'need_planning'                 => 1,
                'created_at'                    => $now,
                'updated_at'                    => $now,
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Activité clôturée. Veuillez planifier la prochaine activité.',
                'data'    => [
                    'historique_id' => $insertedId,
                    'need_planning' => true,
                ]
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


    public function planifierProchaineActivite(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'card_id'                        => 'required|integer',
            'user_id'                        => 'nullable|integer',
            'etab_id'                        => 'nullable|integer',
            'prospect_id'                    => 'nullable|integer',
            'ma_pipline_activites_types_id'  => 'required|integer',
            'date'                           => 'required|date',
            'heure'                          => 'nullable|string',
            'note'                           => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $now = Carbon::now();
            $managerUser = auth('sanctum')->user() ?? auth()->user() ?? $request->user();
            $managerId = $managerUser ? ($managerUser->id ?? null) : $request->input('manager_users_id');

            $insertedId = DB::table('ma_activites_historique')->insertGetId([
                'user_id'                       => $request->input('user_id'),
                'etab_id'                       => $request->input('etab_id'),
                'prospect_id'                   => $request->input('prospect_id'),
                'ma_pipline_activites_types_id' => $request->input('ma_pipline_activites_types_id'),
                'ma_pipline_activites_notes_id' => null,
                'date'                          => $request->input('date'),
                'heure'                         => $request->input('heure'),
                'note'                          => $request->input('note'),
                'manager_users_id'              => $managerId,
                'need_planning'                 => 0,
                'created_at'                    => $now,
                'updated_at'                    => $now,
            ]);

            if ($request->filled('note') && trim($request->input('note')) !== '' && $managerId) {
                DB::table('ma_notes')->insert([
                    'user_id'          => $request->input('user_id'),
                    'etab_id'          => $request->input('etab_id'),
                    'prospect_id'      => $request->input('prospect_id'),
                    'manager_users_id' => $managerId,
                    'note'             => trim($request->input('note')),
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ]);
            }

            DB::table('ma_pipline_cards')
                ->where('id', $request->input('card_id'))
                ->update([
                    'ma_pipline_activites_type_id' => $request->input('ma_pipline_activites_types_id'),
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Nouvelle activité planifiée et ajoutée avec succès',
                'data'    => [
                    'historique_id' => $insertedId,
                    'need_planning' => false,
                ]
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


    public function getHistoriqueActivites(Request $request): JsonResponse
{
    try {
        $userId     = $request->query('user_id');
        $etabId     = $request->query('etab_id');
        $prospectId = $request->query('prospect_id');

        if (empty($userId) && empty($etabId) && empty($prospectId)) {
            return response()->json([
                'status' => 'success',
                'data'   => [],
            ], 200);
        }

        $query = DB::table('ma_activites_historique as mah')
            ->leftJoin('ma_pipline_activites_types as mat', 'mah.ma_pipline_activites_types_id', '=', 'mat.id')
            ->leftJoin('ma_pipline_activites_notes as man', 'mah.ma_pipline_activites_notes_id', '=', 'man.id')
            ->leftJoin('ma_pipline_activites_types as mat_from_note', 'man.ma_pipline_activites_types_id', '=', 'mat_from_note.id')
            ->leftJoin('manager_users as mu', function ($join) {
                $join->on('mu.id', '=', DB::raw('COALESCE(mah.created_by_id, mah.manager_users_id)'));
            })
            ->where('mah.need_planning', 1)
            ->select(
                'mah.id',
                'mah.date',
                'mah.heure',
                'mah.note as user_custom_note',
                'mah.created_by_id',
                'mah.created_at',
                DB::raw("COALESCE(mat.name, mat_from_note.name, 'Appel') as type_name"),
                DB::raw("COALESCE(mat.icone, mat_from_note.icone, 'phone') as type_icone"),
                'man.note as note_selectionnee',
                'mu.id as author_id',
                DB::raw("TRIM(CONCAT(COALESCE(mu.first_name, ''), ' ', COALESCE(mu.last_name, ''))) as author_name"),
                'mu.avatar as author_avatar'
            );

        if (!empty($prospectId)) {
            $query->where('mah.prospect_id', $prospectId);
        } elseif (!empty($etabId)) {
            $query->where('mah.etab_id', $etabId);
        } elseif (!empty($userId)) {
            $query->where('mah.user_id', $userId);
        }

        $historiques = $query->orderBy('mah.id', 'desc')->get();

        $formatted = $historiques->map(function ($item) {
            $dateObj = !empty($item->date) ? Carbon::parse($item->date) : Carbon::parse($item->created_at);
            $heureFormatted = !empty($item->heure) ? substr($item->heure, 0, 5) : $dateObj->format('H:i');

            if ($dateObj->isToday()) {
                $dateText = "Aujourd'hui à " . $heureFormatted;
            } elseif ($dateObj->isYesterday()) {
                $dateText = "Hier à " . $heureFormatted;
            } else {
                $dateText = $dateObj->format('d/m/Y') . " à " . $heureFormatted;
            }

            return [
                'id'                => $item->id,
                'type_name'         => $item->type_name ?? 'Activité',
                'type_icone'        => $item->type_icone ?? 'activity',
                'note_label'        => $item->note_selectionnee ?? ($item->type_name . ' terminé'),
                'user_note'         => $item->user_custom_note,
                'formatted_date'    => $dateText,
                'date_brute'        => $item->date,
                'heure_brute'       => $item->heure,
                'created_by_id'     => $item->created_by_id ? (int)$item->created_by_id : ($item->author_id ? (int)$item->author_id : null),
                'created_by_name'   => $item->author_name ?: 'Commercial',
                'created_by_avatar' => $item->author_avatar,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formatted,
        ], 200);

    } catch (Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur lors de la récupération de l\'historique',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

public function marquerCommePerdu(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'card_id'     => 'nullable|integer',
            'user_id'     => 'nullable|integer',
            'etab_id'     => 'nullable|integer',
            'prospect_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $cardId     = $request->input('card_id');
            $userId     = $request->input('user_id');
            $etabId     = $request->input('etab_id');
            $prospectId = $request->input('prospect_id');

            $cardQuery = DB::table('ma_pipline_cards');

            if (!empty($cardId)) {
                $cardQuery->where('id', $cardId);
            } elseif (!empty($prospectId)) {
                $cardQuery->where('prospect_id', $prospectId);
            } elseif (!empty($userId)) {
                $cardQuery->where('user_id', $userId);
            } elseif (!empty($etabId)) {
                $cardQuery->where('etablissement_id', $etabId);
            } else {
                return response()->json(['status' => 'error', 'message' => 'Opportunité non spécifiée'], 422);
            }

            $card = $cardQuery->first();
            if (!$card) {
                return response()->json(['status' => 'error', 'message' => 'Carte introuvable'], 404);
            }

            $perduEtapeId = DB::table('ma_pipline_etapes')
                ->where('id', 6)
                ->orWhere('name', 'like', '%perdu%')
                ->value('id') ?? 6;

            DB::table('ma_pipline_cards')
                ->where('id', $card->id)
                ->update([
                    'ma_pipline_etape_id' => $perduEtapeId,
                    'updated_at'          => Carbon::now(),
                ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Opportunité marquée comme perdue avec succès',
                'data'    => [
                    'card_id'  => $card->id,
                    'etape_id' => $perduEtapeId
                ]
            ], 200);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


}