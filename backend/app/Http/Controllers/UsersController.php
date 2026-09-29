<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Throwable;
use Illuminate\Support\Facades\Auth;
use App\Models\UserEtabRoles;
use App\Models\AnnonceSignalers;
use Illuminate\Support\Facades\DB;
use App\Models\Ville;
use App\Models\UserManager;
use Illuminate\Http\JsonResponse;

class UsersController extends Controller
{

    public function getUsers(Request $request) {
        try {
            $manager = Auth::user();

            $roleName = $manager->role?->name ?? '';
            $isSuperAdmin = in_array(strtolower($roleName), ['super-admin', 'super admin', 'admin']);

            $userPermission = $manager->role?->permissions()
                ->where('slug', '/users')
                ->first();

            $scope = $userPermission?->pivot->scope ?? 'own';

            $baseQuery = User::query();

            // $allowedUserIds = null;
            // if (!$isSuperAdmin && $scope === 'own') {
            //     $baseQuery->where('users.manager_users_id', $manager->id);
            //     $allowedUserIds = DB::table('users')
            //         ->where('manager_users_id', $manager->id)
            //         ->pluck('id');
            // }

            $allowedUserIds = null;
            if (!$isSuperAdmin && $scope === 'own') {
                if (!empty($manager->is_chef) && !empty($manager->equipe_id)) {
                    $teamUserIds = DB::table('manager_users')
                        ->where('equipe_id', $manager->equipe_id)
                        ->pluck('id')
                        ->toArray();

                    if (!in_array($manager->id, $teamUserIds)) {
                        $teamUserIds[] = $manager->id;
                    }

                    $baseQuery->whereIn('users.manager_users_id', $teamUserIds);
                    $allowedUserIds = DB::table('users')
                        ->whereIn('manager_users_id', $teamUserIds)
                        ->pluck('id');
                } else {
                    $baseQuery->where('users.manager_users_id', $manager->id);
                    $allowedUserIds = DB::table('users')
                        ->where('manager_users_id', $manager->id)
                        ->pluck('id');
                }
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $baseQuery->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('tele', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('id', $search);
                });
            }

            if ($request->filled('ville_id')) {
                $baseQuery->where('ville_id', $request->ville_id);
            }

            if ($request->filled('email_verifie')) {
                $baseQuery->where('is_email_verified', $request->email_verifie === 'true' ? 1 : 0);
            }

            if ($request->filled('telephone_verifie')) {
                $baseQuery->where('is_telephone_verified', $request->telephone_verifie === 'true' ? 1 : 0);
            }

            $users = (clone $baseQuery)
                ->withCount('etablissements', 'connexions', 'publications')
                ->addSelect([
                    'commercial' => function ($query) {
                        $query->selectRaw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, '')))")
                            ->from('manager_users')
                            ->whereColumn('manager_users.id', 'users.manager_users_id')
                            ->limit(1);
                    },
                    'total_compte_pro_gerer' => function ($query) {
                        $query->selectRaw('COUNT(DISTINCT user_etab_roles.etab_id)')
                            ->from('user_etab_roles')
                            ->whereColumn('user_etab_roles.user_id', 'users.id');
                    },
                    'total_vues' => function ($query) {
                        $query->selectRaw('COALESCE(SUM(statistiques_flink.vues), 0)')
                            ->from('statistiques_flink')
                            ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                            ->whereColumn('publications_flink.user_id', 'users.id');
                    },
                    'total_click_tele' => function ($query) {
                        $query->selectRaw('COALESCE(SUM(statistiques_flink.click_tele), 0)')
                            ->from('statistiques_flink')
                            ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                            ->whereColumn('publications_flink.user_id', 'users.id');
                    },
                    'total_click_whatsapp' => function ($query) {
                        $query->selectRaw('COALESCE(SUM(statistiques_flink.click_tele_whatsapp), 0)')
                            ->from('statistiques_flink')
                            ->join('publications_flink', 'publications_flink.id', '=', 'statistiques_flink.publication_id')
                            ->whereColumn('publications_flink.user_id', 'users.id');
                    },
                    'total_favoris' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('sauvgarde_publications')
                            ->whereColumn('sauvgarde_publications.user_id', 'users.id');
                    },
                    'total_followers' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('follows')
                            ->whereColumn('follows.user_following_id', 'users.id');
                    },
                    'ca' => function ($query) {
                        $query->selectRaw('COALESCE(SUM(facturation_vrb.amount), 0)')
                            ->from('facturation_vrb')
                            ->whereColumn('facturation_vrb.user_id', 'users.id')
                            ->whereNull('facturation_vrb.etab_id')
                            ->where(function ($q) {
                                $q->whereNotIn('facturation_vrb.product_id', [5, 7])
                                  ->orWhere('facturation_vrb.mode_paiement', '!=', 'solde')
                                  ->orWhereNull('facturation_vrb.mode_paiement');
                            });
                    },
                    'total_annonces' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('publications_flink')
                            ->whereColumn('publications_flink.user_id', 'users.id')
                            ->whereNull('publications_flink.etab_id')
                            ->where(function ($q) {
                                $q->where('publications_flink.is_marketplace', '!=', 1)
                                ->orWhereNull('publications_flink.is_marketplace');
                            });
                    },
                    'total_annonces_actives' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('publications_flink')
                            ->whereColumn('publications_flink.user_id', 'users.id')
                            ->whereNull('publications_flink.etab_id')
                            ->where(function ($q) {
                                $q->where('publications_flink.is_marketplace', '!=', 0)
                                ->orWhereNull('publications_flink.is_marketplace');
                            });
                    },
                ])
                ->with(['latestConnexion', 'ville:id,name'])
                ->orderBy('updated_at', 'desc')
                ->paginate(25);

            $userIds = $users->pluck('id')->toArray();
            $pipelineCardsByUser = [];
            $activitesByUser = [];

            if (!empty($userIds)) {
                $pipelineCards = DB::table('ma_pipline_cards')
                    ->whereIn('user_id', $userIds)
                    ->select('id as card_id', 'user_id', 'ma_pipline_activites_type_id')
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

                    $pipelineCardsByUser[$card->user_id] = [
                        'card_id'    => $card->card_id,
                        'compte_pro' => $hasComptePro,
                        'solde_ads'  => $adsItem && $adsItem->montant !== null ? (float) $adsItem->montant : 0,
                    ];
                }

                $historiques = DB::table('ma_activites_historique')
                    ->leftJoin('ma_pipline_activites_types', 'ma_pipline_activites_types.id', '=', 'ma_activites_historique.ma_pipline_activites_types_id')
                    ->whereIn('ma_activites_historique.user_id', $userIds)
                    ->orderBy('ma_activites_historique.id', 'desc')
                    ->select([
                        'ma_activites_historique.id',
                        'ma_activites_historique.user_id',
                        'ma_activites_historique.need_planning',
                        'ma_pipline_activites_types.name as type_name',
                    ])
                    ->get()
                    ->groupBy('user_id');

                foreach ($historiques as $uId => $actsGroup) {
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

                    $activitesByUser[$uId] = [
                        'activite_en_cours' => $actuelleName,
                        'derniere_activite' => $derniereName ?: '-',
                    ];
                }
            }

            $users->getCollection()->transform(function ($userItem) use ($pipelineCardsByUser, $activitesByUser) {
                $pData = $pipelineCardsByUser[$userItem->id] ?? null;
                $userItem->compte_pro = $pData ? (bool) $pData['compte_pro'] : false;
                $userItem->solde_ads  = $pData ? (float) $pData['solde_ads'] : 0;

                $actData = $activitesByUser[$userItem->id] ?? null;
                if ($actData) {
                    $userItem->activite_en_cours = $actData['activite_en_cours'];
                    $userItem->derniere_activite = $actData['derniere_activite'];
                } else {
                    $userItem->activite_en_cours = 'Appel';
                    $userItem->derniere_activite = '-';
                }

                $userItem->commercial = !empty($userItem->commercial) ? $userItem->commercial : 'Non assigné';
                // $userItem->secteur    = 'Automobile';
                // $userItem->source     = 'Facebook';

                $userItem->secteur = $userItem->activite_id 
                    ? (DB::table('activites')->where('id', $userItem->activite_id)->value('name') ?: 'Non défini')
                    : 'Non défini';

                $sourceName = null;
                if (!empty($userItem->source_id)) {
                    foreach (['prospect_source', 'prospects_sources', 'user_sources'] as $table) {
                        try {
                            $sourceName = DB::table($table)->where('id', $userItem->source_id)->value('name');
                            if ($sourceName) break;
                        } catch (\Throwable $th) {
                            continue;
                        }
                    }
                }
                $userItem->source = $sourceName ?: 'Non définie';

                $loc = array_filter([$userItem->latestConnexion?->ville, $userItem->latestConnexion?->pays]);
                $connexionSubtitle = !empty($loc) ? implode(', ', $loc) : 'Localisation inconnue';

                $latestAnnonce = DB::table('publications_flink')
                    ->where('user_id', $userItem->id)
                    ->orderBy('created_at', 'desc')
                    ->select('slug', 'created_at')
                    ->first();

                $latestBoost = DB::table('facturation_vrb')
                    ->where('user_id', $userItem->id)
                    ->whereNull('etab_id')
                    ->where('mode_paiement', 'solde')
                    ->orderBy('created_at', 'desc')
                    ->select('numero', 'created_at')
                    ->first();

                $latestPaiement = DB::table('facturation_vrb')
                    ->where('user_id', $userItem->id)
                    ->whereNull('etab_id')
                    ->where(function ($q) {
                        $q->where('mode_paiement', '!=', 'solde')
                          ->orWhereNull('mode_paiement');
                    })
                    ->orderBy('created_at', 'desc')
                    ->select('numero', 'created_at')
                    ->first();

                $userItem->activites = [
                    [
                        'id'       => 1,
                        'type'     => 'connexion',
                        'title'    => 'Connexion',
                        'subtitle' => $connexionSubtitle,
                        'date'     => $userItem->latestConnexion?->date_connexion ?? $userItem->latestConnexion?->derniere_activite,
                    ],
                    [
                        'id'       => 2,
                        'type'     => 'annonce',
                        'title'    => 'Création annonce',
                        'subtitle' => $latestAnnonce ? $latestAnnonce->slug : 'Aucune annonce',
                        'date'     => $latestAnnonce ? $latestAnnonce->created_at : null,
                    ],
                    [
                        'id'       => 3,
                        'type'     => 'boost',
                        'title'    => 'Achat boost',
                        'subtitle' => $latestBoost ? 'Boost #' . $latestBoost->numero : 'Aucun boost',
                        'date'     => $latestBoost ? $latestBoost->created_at : null,
                    ],
                    [
                        'id'       => 4,
                        'type'     => 'paiement',
                        'title'    => 'Paiement',
                        'subtitle' => $latestPaiement ? 'Paiement #' . $latestPaiement->numero : 'Aucun paiement',
                        'date'     => $latestPaiement ? $latestPaiement->created_at : null,
                    ],
                ];

                $userPhones = DB::table('telephones_users_flink')
                    ->join('telephones', 'telephones.id', '=', 'telephones_users_flink.telephone_id')
                    ->where('telephones_users_flink.user_id', $userItem->id)
                    ->whereNull('telephones_users_flink.etab_id')
                    ->select('telephones_users_flink.telephone_id', 'telephones.number as telephone_number')
                    ->distinct()
                    ->get();

                $relationTelephones = [];
                $comptesPro = DB::table('user_etab_roles as uer')
                    ->join('etablissements as e', 'e.id', '=', 'uer.etab_id')
                    ->leftJoin('activites as a', 'a.id', '=', 'e.activite_id')
                    ->where('uer.user_id', $userItem->id)
                    ->select([
                        'e.id',
                        'e.nom',
                        'e.logo',
                        'e.email',
                        'e.default_phone_number as telephone',
                        'e.status',
                        'a.name as activite_name',
                        'uer.created_at as assigned_at',
                    ])
                    ->distinct()
                    ->get();

                $userItem->gestionnaires = $comptesPro;

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

                $userItem->relation_telephones = $relationTelephones;

                return $userItem;
            });

            $filteredUserSubQuery = (clone $baseQuery)->select('users.id');

            $totalUniqueEtablissements = UserEtabRoles::whereIn('user_id', $filteredUserSubQuery)
                ->distinct()
                ->count('etab_id');

            $totalSignalements = AnnonceSignalers::whereIn('user_id', $filteredUserSubQuery)->count();
            $totalConsommationSolde = (clone $baseQuery)->sum('consommation_solde') ?? 0;
            $totalActives = (clone $baseQuery)->where('is_active', 1)->count();
            $totalBloque = (clone $baseQuery)->where('is_active', 0)->count();

            $totalCa = DB::table('facturation_vrb')
                ->whereNull('etab_id')
                ->whereIn('user_id', $filteredUserSubQuery)
                ->where(function ($query) {
                    $query->whereNotIn('product_id', [5, 7])
                          ->orWhere('mode_paiement', '!=', 'solde')
                          ->orWhereNull('mode_paiement');
                })
                ->sum('amount') ?? 0;

            $villesQuery = Ville::select('id', 'name', 'status');
            if ($allowedUserIds !== null) {
                $villesQuery->whereHas('users', function ($q) use ($allowedUserIds) {
                    $q->whereIn('id', $allowedUserIds);
                });
            }
            $villes = $villesQuery->orderBy('name', 'asc')->get();

            return response()->json([
                'data'                     => $users,
                'villes'                   => $villes,
                'total_etablissements'     => $totalUniqueEtablissements,
                'total_signalements'       => $totalSignalements,
                'total_consommation_solde' => $totalConsommationSolde,
                'total_actives'            => $totalActives,
                'total_bloque'             => $totalBloque,
                'total_ca'                 => $totalCa,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

    public function edit(Request $request, $id): JsonResponse
    {
        try {
            $user = User::query()
                ->where('id', $id)
                ->select([
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'tele',
                    'ville_id',
                    'manager_users_id',
                    'is_verified',
                    'is_active',
                    'is_email_verified',
                    'is_telephone_verified',
                ])
                ->with(['ville:id,name'])
                ->first();

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Utilisateur introuvable',
                    'data'    => null
                ], 404);
            }

            $telephones = DB::table('telephones')
                ->join('telephones_users_flink', 'telephones.id', '=', 'telephones_users_flink.telephone_id')
                ->where('telephones_users_flink.user_id', $id)
                ->pluck('telephones.number');

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

            $connexions = DB::table('users_connexions')
                ->where('user_id', $id)
                ->select('adresse_mac', 'ip', 'ville')
                ->get();

            $userManagers = collect();
            if (!empty($user->manager_users_id)) {
                $assignedMgr = DB::table('manager_users')
                    ->where('id', $user->manager_users_id)
                    ->select(['id', 'first_name', 'last_name', 'telephone', 'avatar'])
                    ->first();

                if ($assignedMgr) {
                    $firstName = $assignedMgr->first_name ?? '';
                    $lastName  = $assignedMgr->last_name ?? '';
                    $fullName  = trim("{$firstName} {$lastName}");

                    $userManagers->push([
                        'id'        => (string)$assignedMgr->id,
                        'name'      => $fullName !== '' ? $fullName : 'Commercial #' . $assignedMgr->id,
                        'telephone' => $assignedMgr->telephone,
                        'avatar'    => $assignedMgr->avatar,
                    ]);
                }
            }

            $authManager = $request->user() ?: Auth::user();
            $authManagerId = $authManager ? $authManager->id : null;

            $role = null;
            if (!empty($authManager?->role_id)) {
                $role = DB::table('ma_roles')->where('id', $authManager->role_id)->first();
            }

            $roleName = strtolower(trim($role?->name ?? ($authManager?->role?->name ?? '')));
            $isSuperAdmin = in_array($roleName, ['super-admin', 'super admin', 'superadmin', 'admin']);

            $userPerm = null;
            if ($authManager && !empty($authManager->role_id)) {
                $userPerm = DB::table('ma_role_permissions')
                    ->join('ma_permissions', 'ma_permissions.id', '=', 'ma_role_permissions.permission_id')
                    ->where('ma_role_permissions.role_id', $authManager->role_id)
                    ->where(function ($q) {
                        $q->where('ma_permissions.slug', 'LIKE', '%user%')
                          ->orWhere('ma_permissions.name', 'LIKE', '%user%');
                    })
                    ->select('ma_role_permissions.scope')
                    ->first();
            }

            $scope = $userPerm ? $userPerm->scope : 'own';

            $managersQuery = DB::table('manager_users');

            if (!$isSuperAdmin && $scope === 'own' && $authManager) {
                $isChef = (int)($authManager->is_chef ?? 0) === 1;
                $equipeId = $authManager->equipe_id ?? null;

                if ($isChef && !empty($equipeId)) {
                    $managersQuery->where(function ($q) use ($equipeId, $authManagerId) {
                        $q->where('equipe_id', $equipeId)
                          ->orWhere('id', $authManagerId);
                    });
                } else {
                    $managersQuery->where('id', $authManagerId);
                }
            }

            $allManagers = $managersQuery
                ->select([
                    'id',
                    'first_name',
                    'last_name',
                    'telephone',
                    'avatar'
                ])
                ->get()
                ->map(function ($mgr) {
                    $firstName = $mgr->first_name ?? '';
                    $lastName  = $mgr->last_name ?? '';
                    $fullName  = trim("{$firstName} {$lastName}");

                    return [
                        'id'        => (string)$mgr->id,
                        'name'      => $fullName !== '' ? $fullName : 'Manager #' . $mgr->id,
                        'telephone' => $mgr->telephone,
                        'avatar'    => $mgr->avatar,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'user'         => $user,
                    'telephones'   => $telephones,
                    'villes'       => $villes,
                    'connexions'   => $connexions,
                    'managers'     => $userManagers,
                    'all_managers' => $allManagers,
                ]
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Utilisateur introuvable'
                ], 404);
            }

            $validated = $request->validate([
                // 'first_name'            => 'required|string|max:255',
                // 'last_name'             => 'required|string|max:255',
                // 'email'                 => 'required|email|max:255|unique:users,email,' . $id,
                'first_name' => 'nullable|sometimes|string|max:255',
                'last_name'  => 'nullable|sometimes|string|max:255',
                'email' => 'nullable|sometimes|email|max:255|unique:users,email,' . $id,
                'tele'                  => 'nullable|string|max:20',
                'ville_id'              => 'nullable|exists:villes,id',
                'is_active'             => 'boolean',
                'is_verified'           => 'boolean',
                'is_email_verified'     => 'boolean',
                'is_telephone_verified' => 'boolean',
                'managers'              => 'nullable',
                'manager_users_id'      => 'nullable|exists:manager_users,id',
            ]);

            // $user->first_name            = $validated['first_name'];
            // $user->last_name             = $validated['last_name'];
            // $user->email                 = $validated['email'];
            if ($request->has('first_name')) {
                $user->first_name = $validated['first_name'];
            }
            if ($request->has('last_name')) {
                $user->last_name = $validated['last_name'];
            }
            if ($request->has('email')) {
                $user->email = $validated['email'];
            }
            $user->tele                  = $validated['tele'] ?? null;
            $user->ville_id              = $validated['ville_id'] ?? null;
            $user->is_active             = $request->boolean('is_active') ? 1 : 0;
            $user->is_email_verified     = $request->boolean('is_email_verified') ? 1 : 0;
            $user->is_telephone_verified = $request->boolean('is_telephone_verified') ? 1 : 0;

            if ($request->boolean('is_verified')) {
                if (empty($user->is_verified)) {
                    $user->is_verified = now()->toDateTimeString();
                }
            } else {
                $user->is_verified = null;
            }

            if ($request->filled('manager_users_id')) {
                $user->manager_users_id = (int)$request->input('manager_users_id');
            } elseif ($request->has('managers')) {
                $managers = $request->input('managers');
                if (is_array($managers) && !empty($managers)) {
                    $user->manager_users_id = (int)$managers[0];
                } elseif (!empty($managers)) {
                    $user->manager_users_id = (int)$managers;
                } else {
                    $user->manager_users_id = null;
                }
            }

            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'Utilisateur mis à jour avec succès',
                'user'    => $user
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}