<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Throwable;

class OpportuniteController extends Controller
{

public function getObjectifs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type_user' => 'required|string|in:prospect,user,etablissement',
            'entity_id' => 'required|integer',
        ]);

        try {
            $typeUser = $validated['type_user'];
            $entityId = $validated['entity_id'];

            $productComptePro = DB::table('products')
                ->where('activate_account_min', 1)
                ->select('prix_promo', 'prix')
                ->first();

            $defaultCompteProMontant = 5000.0;
            if ($productComptePro) {
                $defaultCompteProMontant = $productComptePro->prix_promo !== null 
                    ? (float) $productComptePro->prix_promo 
                    : (float) $productComptePro->prix;
            }

            $pendingAds = false;
            $pendingPro = false;
            $pendingAdsAmount = null;
            $pendingProAmount = null;

            if ($typeUser === 'user' || $typeUser === 'etablissement') {
                $facturationQuery = DB::table('facturation_vrb')->where('paid', 2);

                if ($typeUser === 'etablissement') {
                    $facturationQuery->where('etab_id', $entityId);
                } else {
                    $facturationQuery->where('user_id', $entityId);
                }

                $pendingFacturations = $facturationQuery
                    ->whereIn('objectif', ['recharge-solde', 'activation-compte'])
                    ->select('objectif', 'amount')
                    ->get();

                foreach ($pendingFacturations as $fact) {
                    if ($fact->objectif === 'recharge-solde') {
                        $pendingAds = true;
                        $pendingAdsAmount = (float) $fact->amount;
                    }
                    if ($fact->objectif === 'activation-compte') {
                        $pendingPro = true;
                        $pendingProAmount = (float) $fact->amount;
                    }
                }
            }

            $cardQuery = DB::table('ma_pipline_cards')
                ->leftJoin('ma_pipline_etapes', 'ma_pipline_etapes.id', '=', 'ma_pipline_cards.ma_pipline_etape_id')
                ->select([
                    'ma_pipline_cards.*',
                    'ma_pipline_etapes.name as etape_name',
                    'ma_pipline_etapes.id as etape_id',
                ]);

            if ($typeUser === 'prospect') {
                $cardQuery->whereNull('ma_pipline_cards.user_id')->where('ma_pipline_cards.prospect_id', $entityId);
            } elseif ($typeUser === 'user') {
                $cardQuery->where('ma_pipline_cards.user_id', $entityId);
            } elseif ($typeUser === 'etablissement') {
                $cardQuery->where('ma_pipline_cards.etablissement_id', $entityId);
            }

            $card = $cardQuery->orderBy('ma_pipline_cards.id', 'desc')->first();

            if (!$card) {
                return response()->json([
                    'status' => 'success',
                    'data'   => [
                        'card_id'             => null,
                        'opportunite_id'      => 'OP-' . $entityId,
                        'status'              => 'Ouverte',
                        'etape_id'            => 1,
                        'etape_name'          => 'Nouveau',
                        'date_creation'       => now()->format('d/m/Y'),
                        'commercial_name'     => 'Non assigné',
                        'default_pro_montant' => $defaultCompteProMontant,
                        'pending_ads'         => $pendingAds,
                        'pending_pro'         => $pendingPro,
                        'soldes'              => [],
                    ],
                ], 200);
            }

            $interetRecords = DB::table('ma_pipline_card_interets')
                ->join('prospect_interet', 'prospect_interet.id', '=', 'ma_pipline_card_interets.prospect_interet_id')
                ->where('ma_pipline_card_interets.card_id', $card->id)
                ->select([
                    'ma_pipline_card_interets.prospect_interet_id',
                    'ma_pipline_card_interets.montant',
                    'prospect_interet.name as interet_name',
                ])
                ->get();

            $soldes = [];
            foreach ($interetRecords as $rec) {
                $typeKey = match ((int) $rec->prospect_interet_id) {
                    1       => 'user',
                    2       => 'pro',
                    3       => 'ads',
                    4       => 'renouvellement',
                    default => 'autre',
                };

                $montant = $rec->montant !== null ? (float) $rec->montant : null;

                if ($typeKey === 'pro' && ($montant === null || $montant <= 0 || (int)$montant === 1000)) {
                    $montant = $defaultCompteProMontant;
                }

                if ($typeKey === 'ads' && $pendingAds && $pendingAdsAmount !== null) {
                    $montant = $pendingAdsAmount;
                }
                if ($typeKey === 'pro' && $pendingPro && $pendingProAmount !== null) {
                    $montant = $pendingProAmount;
                }

                $soldes[] = [
                    'type'    => $typeKey,
                    'label'   => $rec->interet_name,
                    'montant' => $montant,
                ];
            }

            if ($pendingAds && !collect($soldes)->contains('type', 'ads')) {
                $soldes[] = [
                    'type'    => 'ads',
                    'label'   => 'Solde Ads',
                    'montant' => $pendingAdsAmount ?: 2000,
                ];
            }

            if ($pendingPro && !collect($soldes)->contains('type', 'pro')) {
                $soldes[] = [
                    'type'    => 'pro',
                    'label'   => 'Compte Pro',
                    'montant' => $pendingProAmount ?: $defaultCompteProMontant,
                ];
            }

            $commercialName = 'Non assigné';
            if ($typeUser === 'prospect') {
                $manager = DB::table('prospects')
                    ->join('manager_users', 'manager_users.id', '=', 'prospects.manager_users_id')
                    ->where('prospects.id', $entityId)
                    ->select(DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as full_name"))
                    ->first();

                if ($manager && !empty($manager->full_name)) {
                    $commercialName = $manager->full_name;
                }
            } elseif ($typeUser === 'user') {
                $manager = DB::table('users')
                    ->leftJoin('manager_users', 'manager_users.id', '=', 'users.manager_users_id')
                    ->where('users.id', $entityId)
                    ->select(DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as full_name"))
                    ->first();
                if ($manager && !empty($manager->full_name)) {
                    $commercialName = $manager->full_name;
                }
            } elseif ($typeUser === 'etablissement') {
                $manager = DB::table('etablissements')
                    ->leftJoin('manager_users', 'manager_users.id', '=', 'etablissements.manager_users_id')
                    ->where('etablissements.id', $entityId)
                    ->select(DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as full_name"))
                    ->first();
                if ($manager && !empty($manager->full_name)) {
                    $commercialName = $manager->full_name;
                }
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'card_id'             => $card->id,
                    'opportunite_id'      => 'OP-' . $card->id,
                    'status'              => $card->etape_name ?? 'Ouverte',
                    'etape_id'            => (int) ($card->ma_pipline_etape_id ?? 1),
                    'etape_name'          => $card->etape_name ?? 'Nouveau',
                    'date_creation'       => $card->created_at ? date('d/m/Y', strtotime($card->created_at)) : now()->format('d/m/Y'),
                    'commercial_name'     => $commercialName,
                    'default_pro_montant' => $defaultCompteProMontant,
                    'pending_ads'         => $pendingAds,
                    'pending_pro'         => $pendingPro,
                    'soldes'              => $soldes,
                ],
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des données',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }


public function toggleObjectif(Request $request): JsonResponse
{
    $validated = $request->validate([
        'card_id'       => 'nullable|integer',
        'type_user'     => 'required|string|in:prospect,user,etablissement',
        'entity_id'     => 'required|integer',
        'objectif_type' => 'required|string|in:user,pro,ads,renouvellement',
        'is_selected'   => 'required|boolean',
        'montant'       => 'nullable|numeric|min:0',
    ]);

    try {
        DB::beginTransaction();

        $typeUser   = $validated['type_user'];
        $entityId   = $validated['entity_id'];
        $targetType = $validated['objectif_type'];
        $isSelected = $validated['is_selected'];
        $montant    = $validated['montant'] ?? null;

        $query = DB::table('ma_pipline_cards');

        if (!empty($validated['card_id'])) {
            $query->where('id', $validated['card_id']);
        } else {
            if ($typeUser === 'prospect') {
                $query->whereNull('user_id')->where('prospect_id', $entityId);
            } elseif ($typeUser === 'user') {
                $query->where('user_id', $entityId);
            } elseif ($typeUser === 'etablissement') {
                $query->where('etablissement_id', $entityId);
            }
        }

        $pipelineCard = $query->first();

        if (!$pipelineCard) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Opportunité / Pipeline card introuvable',
            ], 404);
        }

        $interetIdMap = [
            'user'           => 1,
            'pro'            => 2,
            'ads'            => 3,
            'renouvellement' => 4,
        ];

        $interetId = $interetIdMap[$targetType];
        $now = now();

        if ($isSelected) {
            if ($targetType === 'pro' && ($montant === null || (float)$montant <= 0)) {
                $montant = 1000;
            }

            $existing = DB::table('ma_pipline_card_interets')
                ->where('card_id', $pipelineCard->id)
                ->where('prospect_interet_id', $interetId)
                ->first();

            if ($existing) {
                DB::table('ma_pipline_card_interets')
                    ->where('id', $existing->id)
                    ->update([
                        'montant'    => $montant !== null ? (float)$montant : null,
                        'updated_at' => $now,
                    ]);
            } else {
                DB::table('ma_pipline_card_interets')->insert([
                    'card_id'             => $pipelineCard->id,
                    'prospect_interet_id' => $interetId,
                    'montant'             => $montant !== null ? (float)$montant : null,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);
            }
        } else {
            DB::table('ma_pipline_card_interets')
                ->where('card_id', $pipelineCard->id)
                ->where('prospect_interet_id', $interetId)
                ->delete();
        }

        $updatedRecords = DB::table('ma_pipline_card_interets')
            ->join('prospect_interet', 'prospect_interet.id', '=', 'ma_pipline_card_interets.prospect_interet_id')
            ->where('ma_pipline_card_interets.card_id', $pipelineCard->id)
            ->select([
                'ma_pipline_card_interets.prospect_interet_id',
                'ma_pipline_card_interets.montant',
                'prospect_interet.name as interet_name',
            ])
            ->get();

        $currentSoldes = [];
        foreach ($updatedRecords as $rec) {
            $typeKey = match ((int) $rec->prospect_interet_id) {
                1       => 'user',
                2       => 'pro',
                3       => 'ads',
                4       => 'renouvellement',
                default => 'autre',
            };

            $currentSoldes[] = [
                'type'    => $typeKey,
                'label'   => $rec->interet_name,
                'montant' => $rec->montant !== null ? (float) $rec->montant : null,
            ];
        }

        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => 'Objectifs mis à jour avec succès',
            'soldes'  => $currentSoldes,
        ], 200);

    } catch (Throwable $e) {
        DB::rollBack();
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur lors de la mise à jour',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

public function createNewOpportunite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'card_id'       => 'nullable|integer',
            'type_user'     => 'required|string|in:prospect,user,etablissement',
            'entity_id'     => 'required|integer',
            'objectif_type' => 'required|string|in:user,pro,ads,renouvellement',
            'is_selected'   => 'required|boolean',
            'montant'       => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $typeUser   = $validated['type_user'];
            $entityId   = $validated['entity_id'];
            $targetType = $validated['objectif_type'];
            $isSelected = $validated['is_selected'];
            $montant    = $validated['montant'] ?? null;
            $now        = Carbon::now();

            $cardQuery = DB::table('ma_pipline_cards');
            if (!empty($validated['card_id'])) {
                $cardQuery->where('id', $validated['card_id']);
            } else {
                if ($typeUser === 'prospect') {
                    $cardQuery->whereNull('user_id')->where('prospect_id', $entityId);
                } elseif ($typeUser === 'user') {
                    $cardQuery->where('user_id', $entityId);
                } elseif ($typeUser === 'etablissement') {
                    $cardQuery->where('etablissement_id', $entityId);
                }
            }

            $card = $cardQuery->orderBy('id', 'desc')->first();

            if (!$card) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Carte pipeline introuvable.',
                ], 404);
            }

            $cardId = $card->id;

            $interetIdMap = [
                'user'           => 1,
                'pro'            => 2,
                'ads'            => 3,
                'renouvellement' => 4,
            ];
            $interetId = $interetIdMap[$targetType];

            if ($targetType === 'pro' && ($montant === null || (float)$montant <= 0)) {
                $productComptePro = DB::table('products')
                    ->where('activate_account_min', 1)
                    ->select('prix_promo', 'prix')
                    ->first();

                $montant = $productComptePro 
                    ? ($productComptePro->prix_promo ?? $productComptePro->prix ?? 5000) 
                    : 5000;
            }

            if ($isSelected) {
                $existingEncours = DB::table('ma_pipline_card_interets')
                    ->where('card_id', $cardId)
                    ->where('prospect_interet_id', $interetId)
                    ->where('status', 'encours')
                    ->first();

                if ($existingEncours) {
                    DB::table('ma_pipline_card_interets')
                        ->where('id', $existingEncours->id)
                        ->update([
                            'montant'    => $montant !== null ? (float)$montant : null,
                            'updated_at' => $now,
                        ]);
                } else {
                    DB::table('ma_pipline_card_interets')->insert([
                        'card_id'             => $cardId,
                        'prospect_interet_id' => $interetId,
                        'montant'             => $montant !== null ? (float)$montant : null,
                        'status'              => 'encours',
                        'created_at'          => $now,
                        'updated_at'          => $now,
                    ]);
                }
            } else {
                DB::table('ma_pipline_card_interets')
                    ->where('card_id', $cardId)
                    ->where('prospect_interet_id', $interetId)
                    ->where('status', 'encours')
                    ->delete();
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Intérêt ajouté avec succès à la carte existante.',
                'data'    => [
                    'card_id' => $cardId,
                    'status'  => 'encours',
                ]
            ], 200);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la mise à jour des intérêts.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}