<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Throwable;

class CrmPiplineController extends Controller
{

public function getPipeline(Request $request): JsonResponse
    {
        try {
            $etapes = DB::table('ma_pipline_etapes')
                ->select('id', 'name', 'order', 'color', 'score')
                ->orderBy('order', 'asc')
                ->get();

            $etapesMap = $etapes->keyBy('id');

            $cards = DB::table('ma_pipline_cards')
                ->leftJoin('prospects', 'prospects.id', '=', 'ma_pipline_cards.prospect_id')
                ->leftJoin('prospect_source', 'prospect_source.id', '=', 'prospects.prospect_source_id')
                ->leftJoin('users', 'users.id', '=', 'ma_pipline_cards.user_id')
                ->leftJoin('etablissements', 'etablissements.id', '=', 'ma_pipline_cards.etablissement_id')
                ->leftJoin('manager_users', 'manager_users.id', '=', DB::raw("COALESCE(prospects.manager_users_id, users.manager_users_id, etablissements.manager_users_id)"))
                ->leftJoin('ma_pipline_activites_types', 'ma_pipline_activites_types.id', '=', 'ma_pipline_cards.ma_pipline_activites_type_id')
                ->select([
                    'ma_pipline_cards.id',
                    DB::raw("CASE 
                        WHEN ma_pipline_cards.prospect_id IS NOT NULL AND ma_pipline_cards.user_id IS NULL THEN 'prospect'
                        WHEN ma_pipline_cards.user_id IS NOT NULL THEN 'user'
                        WHEN ma_pipline_cards.etablissement_id IS NOT NULL THEN 'etablissement'
                        ELSE 'prospect'
                    END as type_user"),
                    'ma_pipline_cards.position',
                    DB::raw("DATE(ma_pipline_cards.created_at) as date_echeance"),
                    'ma_pipline_cards.prospect_id',
                    'ma_pipline_cards.user_id',
                    'ma_pipline_cards.etablissement_id',
                    'ma_pipline_cards.ma_pipline_etape_id',
                    'ma_pipline_cards.ma_pipline_activites_type_id',
                    'ma_pipline_cards.created_at',

                    DB::raw("COALESCE(prospects.manager_users_id, users.manager_users_id, etablissements.manager_users_id) as manager_users_id"),

                    'prospects.nom as prospect_nom',
                    'prospects.prenom as prospect_prenom',
                    'prospects.name_entreprise as prospect_entreprise',
                    'prospects.solde as prospect_solde',
                    'prospect_source.name as source_name',

                    'users.first_name as user_nom',
                    'users.last_name as user_prenom',

                    'etablissements.nom as etablissement_nom',

                    DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as manager_name"),
                    'manager_users.avatar as manager_avatar',

                    'ma_pipline_activites_types.name as activite_name',
                    'ma_pipline_activites_types.icone as activite_icone',
                ])
                ->orderBy('ma_pipline_cards.position', 'desc')
                ->get();

            $cardIds = $cards->pluck('id')->filter()->toArray();
            $prospectIds = $cards->pluck('prospect_id')->filter()->unique()->toArray();
            $userIds = $cards->pluck('user_id')->filter()->unique()->toArray();
            $etabIds = $cards->pluck('etablissement_id')->filter()->unique()->toArray();

            $cardInteretsGrouped = [];
            if (!empty($cardIds)) {
                $cardInteretsGrouped = DB::table('ma_pipline_card_interets')
                    ->join('prospect_interet', 'prospect_interet.id', '=', 'ma_pipline_card_interets.prospect_interet_id')
                    ->whereIn('ma_pipline_card_interets.card_id', $cardIds)
                    ->select([
                        'ma_pipline_card_interets.card_id',
                        'ma_pipline_card_interets.prospect_interet_id',
                        'ma_pipline_card_interets.montant',
                        'prospect_interet.name as interet_name',
                    ])
                    ->get()
                    ->groupBy('card_id');
            }

            $notesScoreProspects = [];
            if (!empty($prospectIds)) {
                $notesScoreProspects = DB::table('ma_activites_historique as ah')
                    ->join('ma_pipline_activites_notes as an', 'ah.ma_pipline_activites_notes_id', '=', 'an.id')
                    ->whereIn('ah.prospect_id', $prospectIds)
                    ->where('ah.need_planning', 1)
                    ->groupBy('ah.prospect_id')
                    ->select('ah.prospect_id', DB::raw('SUM(an.score) as total_notes_score'))
                    ->pluck('total_notes_score', 'ah.prospect_id')
                    ->toArray();
            }

            $notesScoreUsers = [];
            if (!empty($userIds)) {
                $notesScoreUsers = DB::table('ma_activites_historique as ah')
                    ->join('ma_pipline_activites_notes as an', 'ah.ma_pipline_activites_notes_id', '=', 'an.id')
                    ->whereIn('ah.user_id', $userIds)
                    ->where('ah.need_planning', 1)
                    ->groupBy('ah.user_id')
                    ->select('ah.user_id', DB::raw('SUM(an.score) as total_notes_score'))
                    ->pluck('total_notes_score', 'ah.user_id')
                    ->toArray();
            }

            $notesScoreEtabs = [];
            if (!empty($etabIds)) {
                $notesScoreEtabs = DB::table('ma_activites_historique as ah')
                    ->join('ma_pipline_activites_notes as an', 'ah.ma_pipline_activites_notes_id', '=', 'an.id')
                    ->whereIn('ah.etab_id', $etabIds)
                    ->where('ah.need_planning', 1)
                    ->groupBy('ah.etab_id')
                    ->select('ah.etab_id', DB::raw('SUM(an.score) as total_notes_score'))
                    ->pluck('total_notes_score', 'ah.etab_id')
                    ->toArray();
            }

            $derniersHistoriques = DB::table('ma_activites_historique')
                ->where(function($q) use ($prospectIds, $userIds, $etabIds) {
                    if (!empty($prospectIds)) $q->orWhereIn('prospect_id', $prospectIds);
                    if (!empty($userIds)) $q->orWhereIn('user_id', $userIds);
                    if (!empty($etabIds)) $q->orWhereIn('etab_id', $etabIds);
                })
                ->orderBy('id', 'desc')
                ->get()
                ->groupBy(function($item) {
                    if ($item->prospect_id) return 'prospect_' . $item->prospect_id;
                    if ($item->user_id) return 'user_' . $item->user_id;
                    if ($item->etab_id) return 'etab_' . $item->etab_id;
                    return 'none';
                });

            $now = Carbon::now();
            $today = Carbon::today();

            $formattedCards = $cards->map(function ($card) use ($cardInteretsGrouped, $etapesMap, $notesScoreProspects, $notesScoreUsers, $notesScoreEtabs, $derniersHistoriques, $now, $today) {
                $title = "Sans nom";
                $typeUser = $card->type_user ?? 'prospect';

                if ($typeUser === 'compte_pro' && !empty($card->etablissement_nom)) {
                    $title = $card->etablissement_nom;
                } elseif (!empty($card->user_id)) {
                    $name = trim("{$card->user_nom} {$card->user_prenom}");
                    $title = $name !== '' ? $name : ($card->etablissement_nom ?? 'User #' . $card->user_id);
                } elseif (!empty($card->prospect_id)) {
                    $title = $card->prospect_entreprise 
                        ?: trim("{$card->prospect_nom} {$card->prospect_prenom}") 
                        ?: 'Prospect #' . $card->prospect_id;
                }

                $items = $cardInteretsGrouped[$card->id] ?? collect();
                $allInterets = [];
                $soldesList = [];

                foreach ($items as $ci) {
                    $allInterets[] = [
                        'id'   => (int) $ci->prospect_interet_id,
                        'name' => $ci->interet_name,
                    ];

                    $rawName = trim(strtolower($ci->interet_name));
                    $montant = $ci->montant !== null ? (float)$ci->montant : null;
                    $type = 'autre';
                    $label = $ci->interet_name;

                    if ($ci->prospect_interet_id == 2 || (str_contains($rawName, 'pro') && !str_contains($rawName, 'renouv'))) {
                        $type = 'pro';
                        $label = 'Compte Pro';
                    } elseif ($ci->prospect_interet_id == 3 || str_contains($rawName, 'ads') || str_contains($rawName, 'solde')) {
                        $type = 'ads';
                        $label = 'Solde Ads';
                    } elseif ($ci->prospect_interet_id == 4 || str_contains($rawName, 'renouv')) {
                        $type = 'renouvellement';
                        $label = 'Renouvellement Pro';
                    } elseif ($ci->prospect_interet_id == 1 || str_contains($rawName, 'user')) {
                        $type = 'user';
                        $label = 'Devenir User';
                    }

                    $soldesList[] = [
                        'type'    => $type,
                        'label'   => $label,
                        'montant' => $montant,
                    ];
                }

                $firstInteret = !empty($allInterets) ? $allInterets[0] : null;

                $solde = null;
                if ($typeUser === 'prospect' && !empty($card->prospect_id) && $card->prospect_solde !== null && $card->prospect_solde !== '') {
                    $solde = (float)$card->prospect_solde;
                }

                $entityKey = $card->prospect_id ? 'prospect_' . $card->prospect_id : ($card->user_id ? 'user_' . $card->user_id : ($card->etablissement_id ? 'etab_' . $card->etablissement_id : 'none'));
                $lastHistorique = isset($derniersHistoriques[$entityKey]) ? $derniersHistoriques[$entityKey]->first() : null;

                $hasNeedPlanning = $lastHistorique && (int)$lastHistorique->need_planning === 1;

                $activiteDateStr = ($lastHistorique && !$hasNeedPlanning && !empty($lastHistorique->date)) 
                    ? $lastHistorique->date 
                    : $card->date_echeance;

                $lastActHeure = ($lastHistorique && !$hasNeedPlanning) ? $lastHistorique->heure : null;
                $heureFormatted = $lastActHeure ? substr($lastActHeure, 0, 5) : null;

                $dateText = '—';
                $isHighlight = false;
                $isDatePassed = false;

                if (!empty($activiteDateStr)) {
                    $dt = Carbon::parse($activiteDateStr);
                    if ($dt->isToday()) {
                        $dateText = "Aujourd'hui";
                        $isHighlight = true;
                        if ($heureFormatted) {
                            $fullDateTime = Carbon::parse($activiteDateStr . ' ' . $heureFormatted);
                            if ($fullDateTime->lt($now)) {
                                $isDatePassed = true;
                            }
                        }
                    } elseif ($dt->isTomorrow()) {
                        $dateText = "Demain";
                    } elseif ($dt->isYesterday()) {
                        $dateText = "Hier";
                        $isHighlight = true;
                        $isDatePassed = true;
                    } elseif ($dt->lt($today)) {
                        $dateText = $dt->format('d/m/Y');
                        $isDatePassed = true;
                    } else {
                        $dateText = $dt->format('d/m/Y');
                    }
                }

                $isSansObjectif = (bool)$hasNeedPlanning;
                $isEnRetard = !$isSansObjectif && $isDatePassed;

                $etapeObj = $etapesMap->get($card->ma_pipline_etape_id);
                $etapeScore = $etapeObj && isset($etapeObj->score) ? (int)$etapeObj->score : 0;
                $etapeNameLower = mb_strtolower(trim($etapeObj->name ?? ''));

                $finalScore = 0;
                if (str_contains($etapeNameLower, 'gagn') || str_contains($etapeNameLower, 'win') || (int)$card->ma_pipline_etape_id === 5) {
                    $finalScore = 100;
                } elseif (str_contains($etapeNameLower, 'perdu') || str_contains($etapeNameLower, 'lost') || (int)$card->ma_pipline_etape_id === 6) {
                    $finalScore = 0;
                } else {
                    $notesSum = 0;
                    if (!empty($card->prospect_id)) {
                        $notesSum = (int)($notesScoreProspects[$card->prospect_id] ?? 0);
                    } elseif (!empty($card->user_id)) {
                        $notesSum = (int)($notesScoreUsers[$card->user_id] ?? 0);
                    } elseif (!empty($card->etablissement_id)) {
                        $notesSum = (int)($notesScoreEtabs[$card->etablissement_id] ?? 0);
                    }

                    $computedScore = $etapeScore + $notesSum;
                    $finalScore = max(0, min(100, $computedScore));
                }

                return [
                    'id'                => (string)$card->id,
                    'stage_id'          => (string)$card->ma_pipline_etape_id,
                    'title'             => $title,
                    'user_id'           => $card->user_id ? (int)$card->user_id : null,
                    'etablissement_id'  => $card->etablissement_id ? (int)$card->etablissement_id : null,
                    'prospect_id'       => $card->prospect_id ? (int)$card->prospect_id : null,
                    'type_user'         => $typeUser,
                    'type_user_label'   => $typeUser === 'compte_pro' ? 'Compte Pro' : ($typeUser === 'user' ? 'User' : 'Prospect'),
                    'source_name'       => $card->source_name ?: null,
                    'soldes'            => $soldesList,
                    'type_solde'        => null,
                    'solde'             => $solde,
                    'position'          => (int)$card->position,
                    'score'             => (int)$finalScore,
                    'interet_id'        => $firstInteret['id'] ?? null,
                    'interet_name'      => $firstInteret['name'] ?? null,
                    'interets'          => $allInterets,
                    'manager_id'        => $card->manager_users_id,
                    'manager_name'      => $card->manager_name ?: 'Non assigné',
                    'manager_avatar'    => $card->manager_avatar ?: null,
                    'activite_type_id'  => $card->ma_pipline_activites_type_id,
                    'activite_name'     => $card->activite_name,
                    'activite_icone'    => $card->activite_icone,
                    'date_echeance'     => $activiteDateStr,
                    'date_text'         => $dateText,
                    'heure'             => $heureFormatted,
                    'is_date_highlight' => $isHighlight,
                    'sans_objectif'     => $isSansObjectif,
                    'en_retard'         => $isEnRetard,
                    'need_planning'     => $isSansObjectif,
                ];
            });

            $cardsByStage = $formattedCards->groupBy('stage_id');

            $pipeline = $etapes->map(function ($etape) use ($cardsByStage) {
                $stageIdStr = (string)$etape->id;
                return [
                    'id'    => $stageIdStr,
                    'name'  => $etape->name,
                    'order' => (int)$etape->order,
                    'color' => $etape->color,
                    'score' => (int)($etape->score ?? 0),
                    'count' => isset($cardsByStage[$stageIdStr]) ? $cardsByStage[$stageIdStr]->count() : 0,
                    'cards' => isset($cardsByStage[$stageIdStr]) ? $cardsByStage[$stageIdStr]->values() : [],
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'pipeline'  => $pipeline,
                    'all_cards' => $formattedCards,
                ]
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors du chargement du pipeline',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }

public function moveCard(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'card_id'         => 'required|integer|exists:ma_pipline_cards,id',
            'target_etape_id' => 'required|integer|exists:ma_pipline_etapes,id',
            'new_position'    => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Données invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $cardId = $request->input('card_id');
            $targetEtapeId = (int) $request->input('target_etape_id');
            $newPosition = $request->input('new_position', 0);

            $currentCard = DB::table('ma_pipline_cards')->where('id', $cardId)->first();
            if (!$currentCard) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Carte introuvable',
                ], 404);
            }

            $currentEtapeId = (int) $currentCard->ma_pipline_etape_id;

            $etapeAttenteIds = DB::table('ma_pipline_etapes')
                ->where('id', 4)
                ->orWhere('name', 'like', '%attente%')
                ->pluck('id')
                ->map(fn($id) => (int)$id)
                ->toArray();

            if (in_array($targetEtapeId, $etapeAttenteIds)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Le passage vers l'étape 'En attente' est géré automatiquement lors d'une facturation.",
                ], 403);
            }

            if (in_array($currentEtapeId, $etapeAttenteIds) && $currentEtapeId !== $targetEtapeId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Impossible de déplacer une carte depuis l'étape 'En attente' manuellement.",
                ], 403);
            }

            DB::beginTransaction();

            DB::table('ma_pipline_cards')
                ->where('id', $cardId)
                ->update([
                    'ma_pipline_etape_id' => $targetEtapeId,
                    'position'            => $newPosition,
                    'updated_at'          => Carbon::now(),
                ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Carte déplacée avec succès',
                'data'    => [
                    'card_id'         => $cardId,
                    'target_etape_id' => $targetEtapeId,
                    'new_position'    => $newPosition,
                ]
            ], 200);

        } catch (Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors du déplacement',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}