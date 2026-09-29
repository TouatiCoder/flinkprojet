<?php

namespace App\Http\Controllers\etablissement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Etablissement;
use Illuminate\Support\Facades\DB;
use Throwable;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EtablissementController extends Controller
{

public function getEtablissements(Request $request)
    {
        try {
            $manager = Auth::user();

            $roleName = $manager->role?->name ?? '';
            $isSuperAdmin = in_array(strtolower($roleName), ['super-admin', 'super admin', 'admin']);

            $etabPermission = $manager->role?->permissions()
                ->where(function ($q) {
                    $q->where('slug', '/etablissements')
                      ->orWhere('slug', 'etablissements')
                      ->orWhere('slug', '/etablissement')
                      ->orWhere('slug', 'etablissement');
                })
                ->first();

            $scope = $etabPermission?->pivot->scope ?? 'own';

            $baseQuery = Etablissement::query();

            // $allowedEtabIds = null;
            // if (!$isSuperAdmin && $scope === 'own') {
            //     $baseQuery->where('etablissements.manager_users_id', $manager->id);
            //     $allowedEtabIds = DB::table('etablissements')
            //         ->where('manager_users_id', $manager->id)
            //         ->pluck('id');
            // }

            $allowedEtabIds = null;
            if (!$isSuperAdmin && $scope === 'own') {
                if (!empty($manager->is_chef) && !empty($manager->equipe_id)) {
                    $teamUserIds = DB::table('manager_users')
                        ->where('equipe_id', $manager->equipe_id)
                        ->pluck('id')
                        ->toArray();

                    if (!in_array($manager->id, $teamUserIds)) {
                        $teamUserIds[] = $manager->id;
                    }

                    $baseQuery->whereIn('etablissements.manager_users_id', $teamUserIds);
                    $allowedEtabIds = DB::table('etablissements')
                        ->whereIn('manager_users_id', $teamUserIds)
                        ->pluck('id');
                } else {
                    $baseQuery->where('etablissements.manager_users_id', $manager->id);
                    $allowedEtabIds = DB::table('etablissements')
                        ->where('manager_users_id', $manager->id)
                        ->pluck('id');
                }
            }

            $baseQuery->withCount([
                'publications as publications_count' => function ($query) {
                    $query->where('is_marketplace', 1);
                },
                'publications as posts_count' => function ($query) {
                    $query->where('is_marketplace', 0);
                }
            ])
            ->addSelect([
                'commercial' => function ($query) {
                    $query->selectRaw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, '')))")
                        ->from('manager_users')
                        ->whereColumn('manager_users.id', 'etablissements.manager_users_id')
                        ->limit(1);
                },
                'total_users_gerants' => function ($query) {
                    $query->selectRaw('COALESCE(COUNT(DISTINCT user_etab_roles.user_id), 0)')
                        ->from('user_etab_roles')
                        ->whereColumn('user_etab_roles.etab_id', 'etablissements.id');
                },
                'total_vues' => function ($query) {
                    $query->selectRaw('COALESCE(SUM(statistiques_flink.vues), 0)')
                        ->from('statistiques_flink')
                        ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id');
                },
                'total_click_tele' => function ($query) {
                    $query->selectRaw('COALESCE(SUM(statistiques_flink.click_tele), 0)')
                        ->from('statistiques_flink')
                        ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id');
                },
                'total_click_whatsapp' => function ($query) {
                    $query->selectRaw('COALESCE(SUM(statistiques_flink.click_tele_whatsapp), 0)')
                        ->from('statistiques_flink')
                        ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id');
                },
                'total_favoris' => function ($query) {
                    $query->selectRaw('COUNT(*)')
                        ->from('sauvgarde_publications')
                        ->join('publications_flink', 'publications_flink.id', '=', 'sauvgarde_publications.publication_id')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id');
                },
                'total_followers' => function ($query) {
                    $query->selectRaw('COUNT(*)')
                        ->from('follows')
                        ->whereColumn('follows.etab_following_id', 'etablissements.id');
                },
                'total_annonces_actives' => function ($query) {
                    $query->selectRaw('COUNT(*)')
                        ->from('publications_flink')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id')
                        ->where('publications_flink.is_marketplace', 1);
                },
                'total_annonces' => function ($query) {
                    $query->selectRaw('COUNT(*)')
                        ->from('publications_flink')
                        ->whereColumn('publications_flink.etab_id', 'etablissements.id')
                        ->where(function ($q) {
                            $q->where('publications_flink.is_marketplace', '!=', 1)
                              ->orWhereNull('publications_flink.is_marketplace');
                        });
                },
            ]);

            if ($request->filled('search')) {
                $search = $request->search;
                $baseQuery->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('id', $search);
                });
            }

            if ($request->filled('ville_id')) {
                $baseQuery->where('ville_id', $request->ville_id);
            }

            if ($request->filled('activite_id')) {
                $baseQuery->where('activite_id', $request->activite_id);
            }

            if ($request->filled('statut')) {
                if ($request->statut === 'actif') {
                    $baseQuery->where('status', 1);
                } elseif ($request->statut === 'inactif') {
                    $baseQuery->where('status', -1);
                }
            }

            $etablissements = (clone $baseQuery)
                ->orderBy('updated_at', 'desc')
                ->paginate(20);

            $etabIds = $etablissements->pluck('id')->toArray();
            $pipelineCardsByEtab = [];
            $activitesByEtab = [];

            if (!empty($etabIds)) {
                $pipelineCards = DB::table('ma_pipline_cards')
                    ->whereIn('etablissement_id', $etabIds)
                    ->select('id as card_id', 'etablissement_id', 'ma_pipline_activites_type_id')
                    ->get();

                $cardIds = $pipelineCards->pluck('card_id')->filter()->toArray();

                $cardInterets = [];
                if (!empty($cardIds)) {
                    $cardInterets = DB::table('ma_pipline_card_interets')
                        ->whereIn('card_id', $cardIds)
                        ->where('status', 'encours')
                        ->select('card_id', 'prospect_interet_id', 'montant')
                        ->get()
                        ->groupBy('card_id');
                }

                foreach ($pipelineCards as $card) {
                    $items = $cardInterets[$card->card_id] ?? collect();
                    $hasComptePro = $items->contains('prospect_interet_id', 2);
                    $adsItem = $items->firstWhere('prospect_interet_id', 3);

                    $pipelineCardsByEtab[$card->etablissement_id] = [
                        'card_id'    => $card->card_id,
                        'compte_pro' => $hasComptePro,
                        'solde_ads'  => $adsItem && $adsItem->montant !== null ? (float) $adsItem->montant : 0,
                    ];
                }

                $historiques = DB::table('ma_activites_historique')
                    ->leftJoin('ma_pipline_activites_types', 'ma_pipline_activites_types.id', '=', 'ma_activites_historique.ma_pipline_activites_types_id')
                    ->whereIn('ma_activites_historique.etab_id', $etabIds)
                    ->orderBy('ma_activites_historique.id', 'desc')
                    ->select([
                        'ma_activites_historique.id',
                        'ma_activites_historique.etab_id',
                        'ma_activites_historique.need_planning',
                        'ma_pipline_activites_types.name as type_name',
                    ])
                    ->get()
                    ->groupBy('etab_id');

                foreach ($historiques as $eId => $actsGroup) {
                    $items = $actsGroup->values();

                    $actuelleItem = $items->firstWhere('need_planning', 0);
                    $derniereItem = $items->firstWhere('need_planning', 1);

                    $actuelleName = $actuelleItem ? $actuelleItem->type_name : null;
                    $derniereName = $derniereItem ? $derniereItem->type_name : null;

                    if ($actuelleName === null) {
                        $actuelleName = 'Appel';
                    }

                    if ($derniereName === null && $actuelleName !== 'Appel') {
                        $derniereName = 'Appel';
                    }

                    $activitesByEtab[$eId] = [
                        'activite_en_cours' => $actuelleName,
                        'derniere_activite' => $derniereName ?: '-',
                    ];
                }
            }

            $etablissements->getCollection()->transform(function ($etab) use ($pipelineCardsByEtab, $activitesByEtab) {
                $activite = DB::table('activites')->where('id', $etab->activite_id)->first();
                $etab->secteur = $activite ? $activite->name : '---';

                $ville = DB::table('villes')->where('id', $etab->ville_id)->first();
                $etab->ville = $ville ? $ville->name : null;

                $etab->source = 'Facebook';

                $pData = $pipelineCardsByEtab[$etab->id] ?? null;
                $etab->compte_pro = $pData ? (bool) $pData['compte_pro'] : false;
                $etab->solde_ads  = $pData ? (float) $pData['solde_ads'] : 0;

                $actData = $activitesByEtab[$etab->id] ?? null;
                if ($actData) {
                    $etab->activite_en_cours = $actData['activite_en_cours'];
                    $etab->derniere_activite = $actData['derniere_activite'];
                } else {
                    $etab->activite_en_cours = 'Appel';
                    $etab->derniere_activite = '-';
                }

                $etab->commercial = !empty($etab->commercial) ? $etab->commercial : 'Non assigné';

                $etab->gestionnaires = DB::table('user_etab_roles')
                    ->join('users', 'users.id', '=', 'user_etab_roles.user_id')
                    ->where('user_etab_roles.etab_id', $etab->id)
                    ->select('users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.avatar', 'users.tele')
                    ->distinct()
                    ->get();

                $etab->total_gestionnaires = $etab->gestionnaires->count();
                $managerIds = $etab->gestionnaires->pluck('id')->toArray();
                $relationTelephones = [];

                if (!empty($managerIds)) {
                    $userPhones = DB::table('telephones_users_flink')
                        ->join('telephones', 'telephones.id', '=', 'telephones_users_flink.telephone_id')
                        ->whereIn('telephones_users_flink.user_id', $managerIds)
                        ->select(
                            'telephones_users_flink.telephone_id',
                            'telephones.number as telephone_number'
                        )
                        ->distinct()
                        ->get();

                    foreach ($userPhones as $phone) {
                        $phoneNum = trim($phone->telephone_number);
                        $relatedEntities = collect();

                        $usersFromPhonePivot = DB::table('telephones_users_flink')
                            ->join('users', 'users.id', '=', 'telephones_users_flink.user_id')
                            ->where('telephones_users_flink.telephone_id', $phone->telephone_id)
                            ->select(
                                'users.id',
                                'users.first_name',
                                'users.last_name',
                                'users.email',
                                'users.avatar',
                                DB::raw("'user' as entity_type"),
                                DB::raw("'telephones_users_flink' as source")
                            )
                            ->distinct()
                            ->get();

                        $relatedEntities = $relatedEntities->merge($usersFromPhonePivot);

                        if (!empty($phoneNum)) {
                            $usersFromDirectTele = DB::table('users')
                                ->where('tele', $phoneNum)
                                ->select(
                                    'users.id',
                                    'users.first_name',
                                    'users.last_name',
                                    'users.email',
                                    'users.avatar',
                                    DB::raw("'user' as entity_type"),
                                    DB::raw("'users_table' as source")
                                )
                                ->distinct()
                                ->get();

                            $relatedEntities = $relatedEntities->merge($usersFromDirectTele);

                            $etabsFromDirectPhone = DB::table('etablissements')
                                ->where('default_phone_number', $phoneNum)
                                ->select(
                                    'etablissements.id',
                                    'etablissements.nom as first_name',
                                    DB::raw("'(Établissement)' as last_name"),
                                    'etablissements.email',
                                    'etablissements.logo as avatar',
                                    DB::raw("'etablissement' as entity_type"),
                                    DB::raw("'etablissements_table' as source")
                                )
                                ->distinct()
                                ->get();

                            $relatedEntities = $relatedEntities->merge($etabsFromDirectPhone);
                        }

                        $uniqueRelated = $relatedEntities->unique(function ($item) {
                            return $item->entity_type . '_' . $item->id;
                        })->values();

                        $relationTelephones[] = [
                            'telephone_id'     => $phone->telephone_id,
                            'telephone_number' => $phoneNum,
                            'usage_count'      => $uniqueRelated->count(),
                            'users'            => $uniqueRelated,
                        ];
                    }
                }

                $etab->relation_telephones = $relationTelephones;

                $etab->ca_total = DB::table('facturation_vrb')
                    ->where('etab_id', $etab->id)
                    ->where(function ($q) {
                        $q->where('mode_paiement', '!=', 'solde')
                          ->orWhereNull('mode_paiement');
                    })
                    ->sum('amount') ?? 0;

                $latestPost = DB::table('publications_flink')
                    ->leftJoin('users', 'users.id', '=', 'publications_flink.user_id')
                    ->where('publications_flink.etab_id', $etab->id)
                    ->orderBy('publications_flink.created_at', 'desc')
                    ->select(
                        'publications_flink.slug',
                        'publications_flink.created_at',
                        'users.first_name',
                        'users.last_name'
                    )
                    ->first();

                $latestBoost = DB::table('facturation_vrb')
                    ->leftJoin('users', 'users.id', '=', 'facturation_vrb.user_id')
                    ->where('facturation_vrb.etab_id', $etab->id) 
                    ->where('facturation_vrb.mode_paiement', 'solde')
                    ->orderBy('facturation_vrb.created_at', 'desc')
                    ->select(
                        'facturation_vrb.numero',
                        'facturation_vrb.created_at',
                        'users.first_name',
                        'users.last_name'
                    )
                    ->first();

                $latestPaiement = DB::table('facturation_vrb')
                    ->leftJoin('users', 'users.id', '=', 'facturation_vrb.user_id')
                    ->where('facturation_vrb.etab_id', $etab->id)
                    ->where(function ($q) {
                        $q->where('mode_paiement', '!=', 'solde')
                          ->orWhereNull('mode_paiement');
                    })
                    ->orderBy('facturation_vrb.created_at', 'desc')
                    ->select(
                        'facturation_vrb.numero',
                        'facturation_vrb.created_at',
                        'users.first_name',
                        'users.last_name'
                    )
                    ->first();

                $authorPost = $latestPost ? trim(($latestPost->first_name ?? '') . ' ' . ($latestPost->last_name ?? '')) : '';
                $authorBoost = $latestBoost ? trim(($latestBoost->first_name ?? '') . ' ' . ($latestBoost->last_name ?? '')) : '';
                $authorPaiement = $latestPaiement ? trim(($latestPaiement->first_name ?? '') . ' ' . ($latestPaiement->last_name ?? '')) : '';

                $etab->activites_recentes = [
                    [
                        'id'        => 2,
                        'type'      => 'annonce',
                        'title'     => 'Annonce',
                        'subtitle'  => $latestPost ? str_replace('-', ' ', $latestPost->slug) : 'Aucune annonce',
                        'user_name' => $authorPost ?: null,
                        'date'      => $latestPost ? $latestPost->created_at : null,
                    ],
                    [
                        'id'        => 3,
                        'type'      => 'boost',
                        'title'     => 'Achat boost',
                        'subtitle'  => $latestBoost ? ('Boost #' . $latestBoost->numero) : 'Aucun boost',
                        'user_name' => $authorBoost ?: null,
                        'date'      => $latestBoost ? $latestBoost->created_at : null,
                    ],
                    [
                        'id'        => 4,
                        'type'      => 'paiement',
                        'title'     => 'Paiement',
                        'subtitle'  => $latestPaiement ? ('Paiement #' . $latestPaiement->numero) : 'Aucun paiement',
                        'user_name' => $authorPaiement ?: null,
                        'date'      => $latestPaiement ? $latestPaiement->created_at : null,
                    ],
                ];

                return $etab;
            });

            $totalActives = (clone $baseQuery)->where('status', 1)->count();
            $totalBloque  = (clone $baseQuery)->where('status', -1)->count();
            
            $totalConsommationSolde = 0;

            $totalCa = 0;
            if (!empty($etabIds)) {
                $totalCa = DB::table('facturation_vrb')
                    ->whereIn('etab_id', $etabIds)
                    ->where(function ($q) {
                        $q->where('mode_paiement', '!=', 'solde')
                          ->orWhereNull('mode_paiement');
                    })
                    ->sum('amount') ?? 0;
            }

            $villes = DB::table('villes')
                ->select('id', 'name', 'status')
                ->orderBy('name', 'asc')
                ->get();

            $activites = DB::table('activites')
                ->select('id', 'name', 'status')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'data'                     => $etablissements,
                'villes'                   => $villes,
                'activites'                => $activites,
                'total_actives'            => $totalActives,
                'total_bloque'             => $totalBloque,
                'total_consommation_solde' => $totalConsommationSolde,
                'total_ca'                 => $totalCa,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }


    public function edit(Request $request, $id): JsonResponse
    {
        try {
            $etab = DB::table('etablissements')
                ->where('id', $id)
                ->select([
                    'id',
                    'nom',
                    'email',
                    'default_phone_number',
                    'ville_id',
                    'status',
                    'is_verified',
                ])
                ->first();

            if (!$etab) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Établissement introuvable',
                    'data'    => null
                ], 404);
            }

            $formattedEtab = [
                'id'                   => $etab->id,
                'nom'                  => $etab->nom,
                'email'                => $etab->email,
                'default_phone_number' => $etab->default_phone_number,
                'ville_id'             => $etab->ville_id,
                'status'               => (int)$etab->status === 1,
                'is_verified'          => !empty($etab->is_verified),
            ];

            $telephones = DB::table('telephones_users_flink')
                ->join('telephones', 'telephones.id', '=', 'telephones_users_flink.telephone_id')
                ->where('telephones_users_flink.etab_id', $id)
                ->whereNotNull('telephones.number')
                ->pluck('telephones.number')
                ->map(fn($n) => trim($n))
                ->unique()
                ->values();

            if ($telephones->isEmpty() && !empty($etab->default_phone_number)) {
                $telephones = collect([$etab->default_phone_number]);
            }

            $searchVille = $request->query('search');
            $villesQuery = DB::table('villes')->select('id', 'name');

            if (!empty($searchVille)) {
                $villes = $villesQuery
                    ->where('name', 'LIKE', '%' . $searchVille . '%')
                    ->limit(5)
                    ->get();
            } else {
                $villes = $villesQuery
                    ->whereIn('id', [9, 10, 11, 21, 8])
                    ->limit(5)
                    ->get();
            }

            $etabManagers = DB::table('user_etab_roles')
                ->join('users', 'user_etab_roles.user_id', '=', 'users.id')
                ->where('user_etab_roles.etab_id', $id)
                ->select([
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                ])
                ->distinct()
                ->get()
                ->map(function ($mgr) {
                    $firstName = $mgr->first_name ?? '';
                    $lastName  = $mgr->last_name ?? '';
                    $fullName  = trim("{$firstName} {$lastName}");

                    return [
                        'id'   => (string)$mgr->id,
                        'name' => $fullName !== '' ? $fullName : 'Manager',
                        'role' => null,
                    ];
                });

            $allManagers = DB::table('users')
                ->select([
                    'id',
                    DB::raw("CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) as name")
                ])
                ->whereNotNull('first_name')
                ->limit(30)
                ->get()
                ->map(function ($mgr) {
                    return [
                        'id'   => (string)$mgr->id,
                        'name' => trim($mgr->name) !== '' ? trim($mgr->name) : 'User #' . $mgr->id,
                        'role' => null,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'etablissement' => $formattedEtab,
                    'telephones'    => $telephones,
                    'villes'        => $villes,
                    'managers'      => $etabManagers,
                    // 'all_managers'  => $allManagers,
                ]
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



    public function update(Request $request, $id): JsonResponse
    {
        try {
            $etab = DB::table('etablissements')->where('id', $id)->first();

            if (!$etab) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Établissement introuvable',
                ], 404);
            }

            $request->validate([
                'nom'                  => 'required|string|max:255',
                'email'                => 'nullable|email|max:255',
                'default_phone_number' => 'nullable|string|max:50',
                'ville_id'             => 'nullable|integer',
            ]);

            $statusValue = $etab->status;
            if ($request->has('status')) {
                $statusValue = $request->boolean('status') ? 1 : -1;
            }

            $isVerifiedValue = $etab->is_verified;
            if ($request->has('is_verified')) {
                $isVerifiedValue = $request->boolean('is_verified')
                    ? ($etab->is_verified ?: Carbon::now()->toDateTimeString())
                    : null;
            }

            $phoneNum = trim($request->input('default_phone_number', ''));

            DB::table('etablissements')
                ->where('id', $id)
                ->update([
                    'nom'                  => $request->input('nom', $etab->nom),
                    'email'                => $request->input('email', $etab->email),
                    'default_phone_number' => !empty($phoneNum) ? $phoneNum : null,
                    'ville_id'             => $request->input('ville_id', $etab->ville_id),
                    'status'               => $statusValue,
                    'is_verified'          => $isVerifiedValue,
                    'updated_at'           => Carbon::now(),
                ]);

            if (!empty($phoneNum)) {
                $telephone = DB::table('telephones')->where('number', $phoneNum)->first();
                if (!$telephone) {
                    $teleId = DB::table('telephones')->insertGetId([
                        'number'     => $phoneNum,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]);
                } else {
                    $teleId = $telephone->id;
                }

                $exists = DB::table('telephones_users_flink')
                    ->where('etab_id', $id)
                    ->where('telephone_id', $teleId)
                    ->exists();

                if (!$exists) {
                    DB::table('telephones_users_flink')->insert([
                        'etab_id'      => $id,
                        'telephone_id' => $teleId,
                        'created_at'   => Carbon::now(),
                        'updated_at'   => Carbon::now(),
                    ]);
                }
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Établissement mis à jour avec succès',
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }
}