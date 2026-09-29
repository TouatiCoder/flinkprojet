<?php

namespace App\Http\Controllers\crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Throwable;

class ProspectController extends Controller
{

    public function getCreateData(Request $request): JsonResponse
    {
        try {
            $searchVille = $request->query('search_ville');
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

            $searchActivite = $request->query('search_activite');
            $activitesQuery = DB::table('activites')->select('id', 'name');

            if (!empty($searchActivite)) {
                $activites = $activitesQuery
                    ->where('name', 'LIKE', '%' . $searchActivite . '%')
                    ->get();
            } else {
                $activites = $activitesQuery
                    ->get();
            }

            $sources = DB::table('prospect_source')
                ->where('type', 'prospect')
                ->select('id', 'name')
                ->get();

            $interets = DB::table('prospect_interet')
                ->select('id', 'name')
                ->get();

            $productComptePro = DB::table('products')
            ->where('activate_account_min', 1)
            ->select('prix_promo', 'prix')
            ->first();

            $defaultSoldeComptePro = 5000;
            if ($productComptePro) {
                $defaultSoldeComptePro = $productComptePro->prix_promo !== null 
                    ? (float) $productComptePro->prix_promo 
                    : (float) $productComptePro->prix;
            }

            // $managers = DB::table('manager_users')
            //     ->select([
            //         'id',
            //         'first_name',
            //         'last_name'
            //     ])
            //     ->get()
            //     ->map(function ($mgr) {
            //         $firstName = $mgr->first_name ?? '';
            //         $lastName  = $mgr->last_name ?? '';
            //         $fullName  = trim("{$firstName} {$lastName}");

            //         return [
            //             'id'   => (string)$mgr->id,
            //             'name' => $fullName !== '' ? $fullName : 'Commercial #' . $mgr->id,
            //         ];
            //     });

            $authManager = $request->user() ?: Auth::user();
            $authManagerId = $authManager ? $authManager->id : null;

            $role = null;
            if (!empty($authManager?->role_id)) {
                $role = DB::table('ma_roles')->where('id', $authManager->role_id)->first();
            }

            $roleName = strtolower(trim($role?->name ?? ($authManager?->role?->name ?? '')));
            $isSuperAdmin = in_array($roleName, ['super-admin', 'super admin', 'superadmin']);

            $userPerm = null;
            if ($authManager && !empty($authManager->role_id)) {
                $userPerm = DB::table('ma_role_permissions')
                    ->join('ma_permissions', 'ma_permissions.id', '=', 'ma_role_permissions.permission_id')
                    ->where('ma_role_permissions.role_id', $authManager->role_id)
                    ->where(function ($q) {
                        $q->where('ma_permissions.slug', 'LIKE', '%prospect%')
                          ->orWhere('ma_permissions.slug', 'LIKE', '%user%')
                          ->orWhere('ma_permissions.name', 'LIKE', '%prospect%');
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

            $managers = $managersQuery
                ->select([
                    'id',
                    'first_name',
                    'last_name'
                ])
                ->get()
                ->map(function ($mgr) {
                    $firstName = $mgr->first_name ?? '';
                    $lastName  = $mgr->last_name ?? '';
                    $fullName  = trim("{$firstName} {$lastName}");

                    return [
                        'id'   => (string)$mgr->id,
                        'name' => $fullName !== '' ? $fullName : 'Commercial #' . $mgr->id,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'villes'           => $villes,
                    'activites'        => $activites,
                    'prospect_sources' => $sources,
                    'prospect_interets'=> $interets,
                    'managers'         => $managers,
                    'default_solde_compte_pro' => $defaultSoldeComptePro,
                ]
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la récupération des données',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }

public function store(Request $request): JsonResponse
{
    $fullName = trim((string) $request->input('name', ''));
    $nom      = trim((string) $request->input('nom', ''));
    $prenom   = trim((string) $request->input('prenom', ''));

    if (!empty($fullName)) {
        $parts = preg_split('/\s+/', $fullName, 2);
        $prenom = $parts[0] ?? '';
        $nom    = $parts[1] ?? $parts[0];
    }

    $request->merge([
        'nom'    => $nom,
        'prenom' => $prenom,
    ]);

    $validator = Validator::make($request->all(), [
        'name'               => 'nullable|string|max:255',
        'nom'                => 'required|string|max:255',
        'prenom'             => 'required|string|max:255',
        'telephone'          => 'required|string|max:50',
        'email'              => 'nullable|email|max:255',
        'name_entreprise'    => 'nullable|string|max:255',
        'activite_id'        => 'nullable|integer',
        'ville_id'           => 'nullable|integer',
        'prospect_source_id' => 'nullable|integer',
        'manager_users_id'   => 'nullable|integer',
        'interets'           => 'nullable|array',
        'interets.*'         => 'integer',
        'note'               => 'nullable|string',
        'solde'              => 'nullable|numeric|min:0',
        'type_solde'         => 'nullable|string|max:100',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur de validation',
            'errors'  => $validator->errors(),
        ], 422);
    }

    $rawPhone = trim($request->input('telephone'));
    $cleanPhone = preg_replace('/\D+/', '', $rawPhone);
    $email      = $request->filled('email') ? trim($request->input('email')) : null;

    $phoneInUsers = DB::table('users')
        ->whereRaw("REPLACE(REPLACE(REPLACE(tele, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone])
        ->exists();

    $phoneInProspects = DB::table('prospects')
        ->whereRaw("REPLACE(REPLACE(REPLACE(telephone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone])
        ->exists();

    if ($phoneInUsers || $phoneInProspects) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Ce numéro de téléphone existe déjà sur la plateforme (User ou Prospect).',
            'field'   => 'telephone',
        ], 422);
    }

    if ($email) {
        $existingEmail = DB::table('users')->where('email', $email)->exists();
        if ($existingEmail) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cet email appartient déjà à un utilisateur existant sur la plateforme.',
                'field'   => 'email',
            ], 422);
        }
    }

    try {
        DB::beginTransaction();

        $now = Carbon::now();

        $productComptePro = DB::table('products')
            ->where('activate_account_min', 1)
            ->select('prix_promo', 'prix')
            ->first();

        $defaultSoldeComptePro = 5000.00;
        if ($productComptePro) {
            $defaultSoldeComptePro = $productComptePro->prix_promo !== null 
                ? (float) $productComptePro->prix_promo 
                : (float) $productComptePro->prix;
        }

        $prospectId = DB::table('prospects')->insertGetId([
            'nom'                => $nom,
            'prenom'             => $prenom,
            'telephone'          => $rawPhone,
            'email'              => $email,
            'name_entreprise'    => $request->input('name_entreprise'),
            'activite_id'        => $request->input('activite_id'),
            'ville_id'           => $request->input('ville_id'),
            'prospect_source_id' => $request->input('prospect_source_id'),
            'manager_users_id'   => $request->input('manager_users_id'),
            'note'               => $request->input('note'),
            'solde'              => $request->input('solde'),
            'created_at'         => $now,
            'updated_at'         => $now,
        ]);

        $authorManagerId = $request->input('manager_users_id') 
            ?: ($request->user() ? $request->user()->id : null);

        if ($request->filled('note') && trim($request->input('note')) !== '') {
            if ($authorManagerId) {
                DB::table('ma_notes')->insert([
                    'user_id'          => null,
                    'etab_id'          => null,
                    'prospect_id'      => $prospectId,
                    'manager_users_id' => $authorManagerId,
                    'note'             => trim($request->input('note')),
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ]);
            }
        }

        $cardId = DB::table('ma_pipline_cards')->insertGetId([
            'position'                     => 0,
            'prospect_id'                  => $prospectId,
            'user_id'                      => null,
            'etablissement_id'             => null,
            'ma_pipline_etape_id'          => 1,
            'ma_pipline_activites_type_id' => 1,
            'created_at'                   => $now,
            'updated_at'                   => $now,
        ]);

        $interetIds = $request->input('interets', []);
        if (!empty($interetIds) && is_array($interetIds)) {
            $uniqueInteretIds = array_values(array_unique($interetIds));

            foreach ($uniqueInteretIds as $interetId) {
                $montant = null;

                if ((int)$interetId === 2) {
                    $montant = $request->filled('solde_compte_pro')
                        ? (float)$request->input('solde_compte_pro')
                        : $defaultSoldeComptePro;
                } elseif ((int)$interetId === 3) {
                    $montant = $request->filled('solde_ads')
                        ? (float)$request->input('solde_ads')
                        : null;
                }

                DB::table('ma_pipline_card_interets')->insert([
                    'card_id'             => $cardId,
                    'prospect_interet_id' => $interetId,
                    'montant'             => $montant,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);
            }
        }

        DB::table('ma_activites_historique')->insert([
            'user_id'                       => null,
            'etab_id'                       => null,
            'prospect_id'                   => $prospectId,
            'ma_pipline_activites_types_id' => 1,
            'ma_pipline_activites_notes_id' => null,
            'date'                          => $now->toDateString(),
            'heure'                         => $now->toTimeString(),
            'note'                          => $request->input('note'),
            'manager_users_id'              => $authorManagerId,
            'need_planning'                 => 0,
            'created_at'                    => $now,
            'updated_at'                    => $now,
        ]);

        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => 'Prospect créé avec succès',
            'data'    => [
                'prospect_id' => $prospectId,
                'card_id'     => $cardId,
            ]
        ], 201);

    } catch (Throwable $e) {
        DB::rollBack();

        return response()->json([
            'status'  => 'error',
            'message' => 'Une erreur est survenue lors de la création',
            'error'   => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ], 500);
    }
}


public function getProspects(Request $request): JsonResponse
{
    try {
        $baseQuery = DB::table('prospects')
            ->leftJoin('activites', 'activites.id', '=', 'prospects.activite_id')
            ->leftJoin('villes', 'villes.id', '=', 'prospects.ville_id')
            ->leftJoin('prospect_source', 'prospect_source.id', '=', 'prospects.prospect_source_id')
            ->leftJoin('manager_users', 'manager_users.id', '=', 'prospects.manager_users_id')
            ->select([
                'prospects.id',
                'prospects.nom',
                'prospects.prenom',
                'prospects.telephone',
                'prospects.email',
                'prospects.name_entreprise',
                'prospects.activite_id',
                'activites.name as activite_name',
                'prospects.ville_id',
                'villes.name as ville_name',
                'prospects.prospect_source_id',
                'prospect_source.name as source_name',
                'prospects.manager_users_id',
                'manager_users.avatar as manager_avatar',
                DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as manager_name"),
                'prospects.note',
                'prospects.created_at',
                'prospects.updated_at',
            ]);

        $baseQuery->whereNull('prospects.user_id');

        $authUser = $request->user();
        $userId = $authUser ? $authUser->id : null;

        if ($authUser) {
            $role = DB::table('ma_roles')->where('id', $authUser->role_id)->first();
            $roleName = $role ? strtolower(trim($role->name)) : '';
            $isSuperAdmin = in_array($roleName, ['super admin', 'super-admin', 'superadmin']);

            if (!$isSuperAdmin) {
                $prospectPerm = DB::table('ma_role_permissions')
                    ->join('ma_permissions', 'ma_permissions.id', '=', 'ma_role_permissions.permission_id')
                    ->where('ma_role_permissions.role_id', $authUser->role_id)
                    ->where(function ($q) {
                        $q->where('ma_permissions.slug', 'LIKE', '%prospect%')
                          ->orWhere('ma_permissions.name', 'LIKE', '%prospect%');
                    })
                    ->select('ma_role_permissions.scope')
                    ->first();

                $scope = $prospectPerm ? $prospectPerm->scope : 'own';

                if ($scope === 'own') {
                    if ($authUser->is_chef && !empty($authUser->equipe_id)) {
                        $teamUserIds = DB::table('manager_users')
                            ->where('equipe_id', $authUser->equipe_id)
                            ->pluck('id')
                            ->toArray();

                        if (!in_array($userId, $teamUserIds)) {
                            $teamUserIds[] = $userId;
                        }

                        $baseQuery->whereIn('prospects.manager_users_id', $teamUserIds);
                    } else {
                        $baseQuery->where('prospects.manager_users_id', $userId);
                    }
                }
            }
        }

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $baseQuery->where(function ($q) use ($search) {
                $q->where('prospects.nom', 'LIKE', "%{$search}%")
                  ->orWhere('prospects.prenom', 'LIKE', "%{$search}%")
                  ->orWhere('prospects.telephone', 'LIKE', "%{$search}%")
                  ->orWhere('prospects.email', 'LIKE', "%{$search}%")
                  ->orWhere('prospects.name_entreprise', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('source') && $request->query('source') !== 'all') {
            $baseQuery->where('prospects.prospect_source_id', $request->query('source'));
        }

        if ($request->filled('secteur') && $request->query('secteur') !== 'all') {
            $baseQuery->where('prospects.activite_id', $request->query('secteur'));
        }

        if ($request->filled('commercial') && $request->query('commercial') !== 'all') {
            $baseQuery->where('prospects.manager_users_id', $request->query('commercial'));
        }

        $interetId = $request->query('interet') ?: $request->query('objectif');
        if (!empty($interetId) && $interetId !== 'all') {
            $baseQuery->whereExists(function ($query) use ($interetId) {
                $query->select(DB::raw(1))
                    ->from('ma_pipline_card_interets')
                    ->join('ma_pipline_cards', 'ma_pipline_cards.id', '=', 'ma_pipline_card_interets.card_id')
                    ->whereColumn('ma_pipline_cards.prospect_id', 'prospects.id')
                    ->where('ma_pipline_card_interets.prospect_interet_id', $interetId);
            });
        }

        $etapeId = $request->query('etape');
        if (!empty($etapeId) && $etapeId !== 'all') {
            $baseQuery->whereExists(function ($query) use ($etapeId) {
                $query->select(DB::raw(1))
                    ->from('ma_pipline_cards')
                    ->whereColumn('ma_pipline_cards.prospect_id', 'prospects.id')
                    ->whereNull('ma_pipline_cards.user_id')
                    ->whereNotNull('ma_pipline_cards.prospect_id')
                    ->where('ma_pipline_cards.ma_pipline_etape_id', $etapeId);
            });
        }

        $perPage = $request->query('per_page', 20);
        $prospects = $baseQuery->orderBy('prospects.created_at', 'desc')->paginate($perPage);

        $prospectIds = $prospects->pluck('id')->toArray();
        $interetsByProspect = [];
        $pipelineDataByProspect = [];
        $activitesByProspect = [];

        if (!empty($prospectIds)) {
            $pipelineCards = DB::table('ma_pipline_cards')
                ->leftJoin('ma_pipline_etapes', 'ma_pipline_etapes.id', '=', 'ma_pipline_cards.ma_pipline_etape_id')
                ->leftJoin('ma_pipline_activites_types', 'ma_pipline_activites_types.id', '=', 'ma_pipline_cards.ma_pipline_activites_type_id')
                ->whereNull('ma_pipline_cards.user_id')
                ->whereIn('ma_pipline_cards.prospect_id', $prospectIds)
                ->select([
                    'ma_pipline_cards.id as card_id',
                    'ma_pipline_cards.prospect_id',
                    DB::raw("DATE(ma_pipline_cards.created_at) as date_echeance"),
                    'ma_pipline_cards.ma_pipline_etape_id',
                    'ma_pipline_cards.ma_pipline_activites_type_id',
                    'ma_pipline_cards.created_at as card_activite_created_at',
                    'ma_pipline_etapes.name as etape_name',
                    'ma_pipline_activites_types.name as activite_type_name',
                    'ma_pipline_activites_types.icone as activite_type_icone',
                    'ma_pipline_activites_types.created_at as activite_type_created_at',
                ])
                ->get();

            $cardIds = $pipelineCards->pluck('card_id')->filter()->toArray();

            $cardInterets = [];
            if (!empty($cardIds)) {
                $cardInterets = DB::table('ma_pipline_card_interets')
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

            foreach ($pipelineCards as $card) {
                $soldesList = [];
                $totalAds = 0;
                $totalPro = 0;
                $totalRenouvellement = 0;

                $items = $cardInterets[$card->card_id] ?? collect();

                foreach ($items as $ci) {
                    $rawName = trim(strtolower($ci->interet_name));
                    $montant = $ci->montant !== null ? (float)$ci->montant : 0;
                    $type = 'autre';
                    $label = $ci->interet_name;
                    $shortName = 'Autre';

                    if ($ci->prospect_interet_id == 2 || (str_contains($rawName, 'pro') && !str_contains($rawName, 'renouv'))) {
                        $type = 'pro';
                        $label = 'Compte Pro';
                        $shortName = 'Pro';
                        $totalPro += $montant;
                    } elseif ($ci->prospect_interet_id == 3 || str_contains($rawName, 'ads') || str_contains($rawName, 'solde')) {
                        $type = 'ads';
                        $label = 'Solde Ads';
                        $shortName = 'Ads';
                        $totalAds += $montant;
                    } elseif ($ci->prospect_interet_id == 4 || str_contains($rawName, 'renouv')) {
                        $type = 'renouvellement';
                        $label = 'Renouvellement Pro';
                        $shortName = 'Renouvellement';
                        $totalRenouvellement += $montant;
                    } elseif ($ci->prospect_interet_id == 1 || str_contains($rawName, 'user')) {
                        $type = 'user';
                        $label = 'Devenir User';
                        $shortName = 'User';
                    }

                    $soldesList[] = [
                        'type'    => $type,
                        'label'   => $label,
                        'montant' => $montant,
                    ];

                    $interetsByProspect[$card->prospect_id][] = [
                        'id'         => $ci->prospect_interet_id,
                        'name'       => $ci->interet_name,
                        'short_name' => $shortName,
                    ];
                }

                $pipelineDataByProspect[$card->prospect_id] = [
                    'card_id'                      => $card->card_id,
                    'date_echeance'                => $card->date_echeance,
                    'ma_pipline_etape_id'          => $card->ma_pipline_etape_id,
                    'etape_name'                   => $card->etape_name,
                    'ma_pipline_activites_type_id' => $card->ma_pipline_activites_type_id,
                    'activite_type'                => $card->ma_pipline_activites_type_id ? [
                        'id'         => $card->ma_pipline_activites_type_id,
                        'name'       => $card->activite_type_name,
                        'icone'      => $card->activite_type_icone,
                        'created_at' => $card->activite_type_created_at,
                    ] : null,
                    'soldes'                       => $soldesList,
                    'montants'                     => [
                        'total'          => $totalAds + $totalPro + $totalRenouvellement,
                        'solde_ads'      => $totalAds,
                        'compte_pro'     => $totalPro,
                        'renouvellement' => $totalRenouvellement,
                    ],
                ];
            }

            $historiques = DB::table('ma_activites_historique')
                ->leftJoin('ma_pipline_activites_types', 'ma_pipline_activites_types.id', '=', 'ma_activites_historique.ma_pipline_activites_types_id')
                ->whereIn('ma_activites_historique.prospect_id', $prospectIds)
                ->where('ma_activites_historique.need_planning', 0)
                ->orderBy('ma_activites_historique.id', 'desc')
                ->select([
                    'ma_activites_historique.id',
                    'ma_activites_historique.prospect_id',
                    'ma_activites_historique.note',
                    'ma_activites_historique.date',
                    'ma_activites_historique.heure',
                    'ma_activites_historique.created_at',
                    'ma_pipline_activites_types.id as type_id',
                    'ma_pipline_activites_types.name as type_name',
                    'ma_pipline_activites_types.icone as type_icone',
                ])
                ->get()
                ->groupBy('prospect_id');

            foreach ($historiques as $pId => $actsGroup) {
                $items = $actsGroup->values();

                $actuelleRaw = $items->get(0);
                $derniereRaw = $items->get(1);

                $activitesByProspect[$pId] = [
                    'activite_actuelle' => $actuelleRaw ? [
                        'id'         => $actuelleRaw->id,
                        'note'       => $actuelleRaw->note,
                        'date'       => $actuelleRaw->date,
                        'heure'      => $actuelleRaw->heure,
                        'created_at' => $actuelleRaw->created_at,
                        'type_name'  => $actuelleRaw->type_name,
                        'type_icone' => $actuelleRaw->type_icone,
                    ] : null,
                    'derniere_activite' => $derniereRaw ? [
                        'id'         => $derniereRaw->id,
                        'note'       => $derniereRaw->note,
                        'date'       => $derniereRaw->date,
                        'heure'      => $derniereRaw->heure,
                        'created_at' => $derniereRaw->created_at,
                        'type_name'  => $derniereRaw->type_name,
                        'type_icone' => $derniereRaw->type_icone,
                    ] : null,
                ];
            }
        }

        $prospects->getCollection()->transform(function ($prospect) use ($interetsByProspect, $pipelineDataByProspect, $activitesByProspect) {
            $prospectId = $prospect->id;

            $pipelineInfo = $pipelineDataByProspect[$prospectId] ?? [
                'card_id'                      => null,
                'date_echeance'                => null,
                'ma_pipline_etape_id'          => null,
                'etape_name'                   => null,
                'ma_pipline_activites_type_id' => null,
                'activite_type'                => null,
                'soldes'                       => [],
                'montants'                     => [
                    'total'          => 0,
                    'solde_ads'      => 0,
                    'compte_pro'     => 0,
                    'renouvellement' => 0,
                ],
            ];

            $prospect->interets = $interetsByProspect[$prospectId] ?? [];
            // $prospect->commercial = [
            //     'id'     => $prospect->manager_users_id,
            //     'name'   => $prospect->manager_name ?: 'Non assigné',
            //     'avatar' => $prospect->manager_avatar,
            // ];

            $avatarUrl = null;
            if (!empty($prospect->manager_avatar)) {
                $avatarUrl = str_starts_with($prospect->manager_avatar, 'http')
                    ? $prospect->manager_avatar
                    : asset($prospect->manager_avatar);
            }

            $prospect->commercial = [
                'id'     => $prospect->manager_users_id,
                'name'   => $prospect->manager_name ?: 'Non assigné',
                'avatar' => $avatarUrl,
            ];

            $prospect->card_id = $pipelineInfo['card_id'];
            $prospect->ma_pipline_etape_id = $pipelineInfo['ma_pipline_etape_id'];
            $prospect->etape_name = $pipelineInfo['etape_name'];
            $prospect->soldes = $pipelineInfo['soldes'];
            $prospect->montants = $pipelineInfo['montants'];
            $prospect->ma_pipline_activites_type_id = $pipelineInfo['ma_pipline_activites_type_id'];
            $prospect->activite_type = $pipelineInfo['activite_type'];

            $actData = $activitesByProspect[$prospectId] ?? null;

            $fallbackCardAct = $pipelineInfo['activite_type'] ? [
                'id'         => null,
                'note'       => $prospect->note,
                'date'       => $pipelineInfo['date_echeance'] ?? ($prospect->created_at ? date('Y-m-d', strtotime($prospect->created_at)) : null),
                'heure'      => null,
                'created_at' => $pipelineInfo['activite_type']['created_at'] ?? $prospect->created_at,
                'type_name'  => $pipelineInfo['activite_type']['name'] ?? null,
                'type_icone' => $pipelineInfo['activite_type']['icone'] ?? null,
            ] : null;

            if ($actData && $actData['activite_actuelle']) {
                $prospect->activite_actuelle = $actData['activite_actuelle'];

                if ($actData['derniere_activite']) {
                    $prospect->derniere_activite = $actData['derniere_activite'];
                } else {
                    $isDifferent = $fallbackCardAct && ($fallbackCardAct['type_name'] !== $actData['activite_actuelle']['type_name']);
                    $prospect->derniere_activite = $isDifferent ? $fallbackCardAct : null;
                }
            } else {
                $prospect->activite_actuelle = $fallbackCardAct;
                $prospect->derniere_activite = null;
            }

            return $prospect;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $prospects,
        ], 200);

    } catch (Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Une erreur est survenue lors de la récupération des prospects',
            'error'   => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ], 500);
    }
}


public function getFilterResponsables(Request $request): JsonResponse
    {
        try {
            $authUser = $request->user();
            $userId   = $authUser ? $authUser->id : null;

            $query = DB::table('manager_users')
                ->select([
                    'id',
                    'first_name',
                    'last_name',
                    'avatar',
                    'equipe_id',
                    'is_chef',
                ]);

            if ($authUser) {
                $role = DB::table('ma_roles')->where('id', $authUser->role_id)->first();
                $roleName = $role ? strtolower(trim($role->name)) : '';
                $isSuperAdmin = in_array($roleName, ['super admin', 'super-admin', 'superadmin']);

                if (!$isSuperAdmin) {
                    $prospectPerm = DB::table('ma_role_permissions')
                        ->join('ma_permissions', 'ma_permissions.id', '=', 'ma_role_permissions.permission_id')
                        ->where('ma_role_permissions.role_id', $authUser->role_id)
                        ->where(function ($q) {
                            $q->where('ma_permissions.slug', 'LIKE', '%prospect%')
                              ->orWhere('ma_permissions.name', 'LIKE', '%prospect%');
                        })
                        ->select('ma_role_permissions.scope')
                        ->first();

                    $scope = $prospectPerm ? $prospectPerm->scope : 'own';

                    if ($scope === 'own') {
                        if ($authUser->is_chef && !empty($authUser->equipe_id)) {
                            $query->where('equipe_id', $authUser->equipe_id);
                        } else {
                            $query->where('id', $userId);
                        }
                    }
                }
            }

            $responsables = $query->get()->map(function ($u) {
                $firstName = $u->first_name ?? '';
                $lastName  = $u->last_name ?? '';
                $fullName  = trim("{$firstName} {$lastName}");

                return [
                    'id'     => (string)$u->id,
                    'name'   => $fullName !== '' ? $fullName : 'Commercial #' . $u->id,
                    'avatar' => $u->avatar ?? null,
                    'role'   => !empty($u->is_chef) ? "Chef d'équipe" : "Commercial",
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => $responsables,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des responsables',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }


    public function getNotesByProspect(Request $request, $id): JsonResponse
{
    try {
        $type = $request->query('type', 'prospect');

        $query = DB::table('ma_notes')
            ->leftJoin('manager_users', 'manager_users.id', '=', 'ma_notes.manager_users_id')
            ->select([
                'ma_notes.id',
                'ma_notes.user_id',
                'ma_notes.etab_id',
                'ma_notes.prospect_id',
                'ma_notes.note',
                'ma_notes.created_at',
                'ma_notes.manager_users_id',
                'manager_users.avatar as author_avatar',
                DB::raw("TRIM(CONCAT(COALESCE(manager_users.first_name, ''), ' ', COALESCE(manager_users.last_name, ''))) as author_name"),
            ]);

        if ($type === 'user') {
            $query->where('ma_notes.user_id', $id);
        } elseif ($type === 'etablissement') {
            $query->where('ma_notes.etab_id', $id);
        } else {
            $query->where('ma_notes.prospect_id', $id);
        }

        $notes = $query->orderBy('ma_notes.id', 'desc')->get()->map(function ($note) {
            return [
                'id'               => $note->id,
                'user_id'          => $note->user_id,
                'etab_id'          => $note->etab_id,
                'prospect_id'      => $note->prospect_id,
                'note'             => $note->note,
                'created_at'       => $note->created_at,
                'manager_users_id' => $note->manager_users_id,
                'author'           => [
                    'id'     => $note->manager_users_id,
                    'name'   => $note->author_name ?: 'Commercial #' . $note->manager_users_id,
                    'avatar' => $note->author_avatar,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $notes,
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur de chargement des notes',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


    public function storeNote(Request $request, $id): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'note' => 'required|string',
        'type' => 'nullable|string|in:prospect,user,etablissement',
    ], [
        'note.required' => 'Le contenu de la note est obligatoire.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur de validation',
            'errors'  => $validator->errors(),
        ], 422);
    }

    try {
        $authUser = $request->user() ?? auth('sanctum')->user() ?? auth()->user();
        if (!$authUser) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Utilisateur non authentifié.',
            ], 401);
        }

        $type = $request->input('type', 'prospect');
        $prospectId = null;
        $userId = null;
        $etabId = null;

        if ($type === 'user') {
            $userId = (int) $id;
        } elseif ($type === 'etablissement') {
            $etabId = (int) $id;
        } else {
            $prospectId = (int) $id;
        }

        $now = Carbon::now();

        $noteId = DB::table('ma_notes')->insertGetId([
            'user_id'          => $userId,
            'etab_id'          => $etabId,
            'prospect_id'      => $prospectId,
            'manager_users_id' => $authUser->id,
            'note'             => trim($request->input('note')),
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);

        if ($prospectId || $userId) {
            DB::table('prospect_historiques')->insert([
                'prospect_id' => $prospectId,
                'user_id'     => $userId,
                'action'      => 'note_added',
                'title'       => 'Note ajoutée',
                'description' => strip_tags(trim($request->input('note'))),
                'old_values'  => null,
                'new_values'  => json_encode(['note' => trim($request->input('note'))]),
                'manager_id'  => $authUser->id,
                'created_at'  => $now,
            ]);
        }

        $authorName = trim(($authUser->first_name ?? '') . ' ' . ($authUser->last_name ?? ''));

        return response()->json([
            'status'  => 'success',
            'message' => 'Note ajoutée avec succès.',
            'data'    => [
                'id'               => $noteId,
                'user_id'          => $userId,
                'etab_id'          => $etabId,
                'prospect_id'      => $prospectId,
                'note'             => trim($request->input('note')),
                'created_at'       => $now->toDateTimeString(),
                'manager_users_id' => $authUser->id,
                'author'           => [
                    'id'     => $authUser->id,
                    'name'   => $authorName !== '' ? $authorName : 'Commercial #' . $authUser->id,
                    'avatar' => $authUser->avatar ?? null,
                ],
            ],
        ], 201);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Une erreur est survenue lors de l\'ajout de la note.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


public function update(Request $request, $id): JsonResponse
{
    $fullName = trim((string) $request->input('name', ''));
    $nom      = trim((string) $request->input('nom', ''));
    $prenom   = trim((string) $request->input('prenom', ''));

    if (!empty($fullName)) {
        $parts  = preg_split('/\s+/', $fullName, 2);
        $prenom = $parts[0] ?? '';
        $nom    = $parts[1] ?? $parts[0];
    }

    $request->merge([
        'nom'    => $nom,
        'prenom' => $prenom,
    ]);

    $validator = Validator::make($request->all(), [
        'name'               => 'nullable|string|max:255',
        'nom'                => 'required|string|max:255',
        'prenom'             => 'required|string|max:255',
        'telephone'          => 'required|string|max:50',
        'email'              => 'nullable|email|max:255',
        'name_entreprise'    => 'nullable|string|max:255',
        'activite_id'        => 'nullable|integer',
        'ville_id'           => 'nullable|integer',
        'prospect_source_id' => 'nullable|integer',
        'manager_users_id'   => 'nullable|integer',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur de validation',
            'errors'  => $validator->errors(),
        ], 422);
    }

    $prospect = DB::table('prospects')->where('id', $id)->first();
    if (!$prospect) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Prospect introuvable.',
        ], 404);
    }

    $rawPhone   = trim($request->input('telephone'));
    $cleanPhone = preg_replace('/\D+/', '', $rawPhone);
    $email      = $request->filled('email') ? trim($request->input('email')) : null;

    $phoneInUsers = DB::table('users')
        ->whereRaw("REPLACE(REPLACE(REPLACE(tele, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone])
        ->when($prospect->user_id, function ($q, $uid) {
            return $q->where('id', '!=', $uid);
        })
        ->exists();

    $phoneInProspects = DB::table('prospects')
        ->whereRaw("REPLACE(REPLACE(REPLACE(telephone, ' ', ''), '-', ''), '+', '') = ?", [$cleanPhone])
        ->where('id', '!=', $id)
        ->exists();

    if ($phoneInUsers || $phoneInProspects) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Ce numéro de téléphone existe déjà sur la plateforme.',
            'field'   => 'telephone',
        ], 422);
    }

    if ($email) {
        $existingEmail = DB::table('users')
            ->where('email', $email)
            ->when($prospect->user_id, function ($q, $uid) {
                return $q->where('id', '!=', $uid);
            })
            ->exists();

        if ($existingEmail) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cet email appartient déjà à un utilisateur existant sur la plateforme.',
                'field'   => 'email',
            ], 422);
        }
    }

    try {
        DB::beginTransaction();

        $updateData = [
            'nom'                => $nom,
            'prenom'             => $prenom,
            'telephone'          => $rawPhone,
            'email'              => $email,
            'name_entreprise'    => $request->input('name_entreprise'),
            'activite_id'        => $request->input('activite_id'),
            'ville_id'           => $request->input('ville_id'),
            'prospect_source_id' => $request->input('prospect_source_id'),
            'updated_at'         => Carbon::now(),
        ];

        if ($request->has('manager_users_id')) {
            $updateData['manager_users_id'] = $request->input('manager_users_id');
        }

        DB::table('prospects')->where('id', $id)->update($updateData);

        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => 'Prospect mis à jour avec succès',
        ], 200);

    } catch (\Throwable $e) {
        DB::rollBack();

        return response()->json([
            'status'  => 'error',
            'message' => 'Une erreur est survenue lors de la mise à jour',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


public function getStatsCards(Request $request): JsonResponse
{
    try {
        $authUser = auth('sanctum')->user() ?? auth()->user() ?? $request->user();
        if (!$authUser) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Utilisateur non authentifié',
            ], 401);
        }

        $currentUserId = $authUser->id;

        $role = DB::table('ma_roles')->where('id', $authUser->role_id)->first();
        $roleName = $role ? strtolower(trim($role->name)) : '';
        $isSuperAdmin = in_array($roleName, ['super admin', 'super-admin', 'superadmin']);
        $isChef = (bool) $authUser->is_chef && !empty($authUser->equipe_id);

        $selectedCommercial = $request->query('commercial') ?: $request->query('responsable');

        $targetManagerIds = [];

        if (!empty($selectedCommercial) && $selectedCommercial !== 'all') {
            $targetManagerIds = [(int) $selectedCommercial];
        } else {
            if ($isSuperAdmin) {
                $targetManagerIds = DB::table('manager_users')->pluck('id')->toArray();
            } elseif ($isChef) {
                $targetManagerIds = DB::table('manager_users')
                    ->where('equipe_id', $authUser->equipe_id)
                    ->pluck('id')
                    ->toArray();
                if (!in_array($currentUserId, $targetManagerIds)) {
                    $targetManagerIds[] = $currentUserId;
                }
            } else {
                $targetManagerIds = [$currentUserId];
            }
        }

        if (empty($targetManagerIds)) {
            $targetManagerIds = [$currentUserId];
        }

        $targetManagersData = DB::table('manager_users')
            ->whereIn('id', $targetManagerIds)
            ->get();

        $baseObjUsersSemaine = (float) $targetManagersData->sum(function ($u) {
            return $u->objectif_users_semaine ?? $u->objectif_users_jour ?? 0;
        });
        $baseObjComptesMois = (float) $targetManagersData->sum('objectif_comptes_mois');
        $baseObjSoldeAn     = (float) $targetManagersData->sum('objectif_solde_an');

        $periode = $request->query('periode', 'mois');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $now = Carbon::now();
        $start = null;
        $end = null;
        $periodeLabel = 'Ce mois';

        switch ($periode) {

            case 'aujourdhui':
            case 'today':
                $start = $now->copy()->startOfDay();
                $end   = $now->copy()->endOfDay();
                $periodeLabel = "Aujourd'hui";
                break;

            case 'semaine':
                $start = $now->copy()->startOfWeek();
                $end   = $now->copy()->endOfWeek();
                $periodeLabel = 'Cette semaine';
                break;
            case 'mois':
                $start = $now->copy()->startOfMonth();
                $end   = $now->copy()->endOfMonth();
                $periodeLabel = 'Ce mois';
                break;
            case 'annee':
                $start = $now->copy()->startOfYear();
                $end   = $now->copy()->endOfYear();
                $periodeLabel = 'Cette année';
                break;
            case 'custom':
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end   = Carbon::parse($endDate)->endOfDay();
                    $periodeLabel = 'Période personnalisée';
                }
                break;
            case 'all':
            default:
                $start = null;
                $end   = null;
                $periodeLabel = 'Toutes les dates';
                break;
        }

        $usersMultiplier   = 1;
        $comptesMultiplier = 1;
        $soldeMultiplier   = 1;

        if ($periode === 'aujourdhui' || $periode === 'today') {
            $usersMultiplier   = 1 / 6;
            $comptesMultiplier = 1 / 26;
            $soldeMultiplier   = 1 / 365;
        } elseif ($periode === 'semaine') {
            $usersMultiplier   = 1;
            $comptesMultiplier = 0.25;
            $soldeMultiplier   = 1 / 52;
        } elseif ($periode === 'mois') {
            $usersMultiplier   = 4;
            $comptesMultiplier = 1;
            $soldeMultiplier   = 1 / 12;
        } elseif ($periode === 'annee') {
            $usersMultiplier   = 52;
            $comptesMultiplier = 12;
            $soldeMultiplier   = 1;
        } elseif ($periode === 'custom' && $start && $end) {
            $days = $start->diffInDays($end) + 1;
            $usersMultiplier   = round($days / 7, 2);
            $comptesMultiplier = round($days / 30, 2);
            $soldeMultiplier   = round($days / 365, 2);
        }

        $targetUsers   = (int) round($baseObjUsersSemaine * $usersMultiplier);
        $targetComptes = (int) round($baseObjComptesMois * $comptesMultiplier);
        $targetSolde   = (float) round($baseObjSoldeAn * $soldeMultiplier, 2);

        $usersQuery = DB::table('prospects')
            ->whereIn('manager_users_id', $targetManagerIds)
            ->whereNotNull('user_id');

        if ($start && $end) {
            $usersQuery->whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()]);
        }

        if ($request->filled('secteur') && $request->query('secteur') !== 'all') {
            $usersQuery->where('activite_id', $request->query('secteur'));
        }

        $interetId = $request->input('objectif') ?: $request->input('interet');
        if (!empty($interetId) && $interetId !== 'all') {
            $usersQuery->whereExists(function ($sub) use ($interetId) {
                $sub->select(DB::raw(1))
                    ->from('ma_pipline_card_interets')
                    ->join('ma_pipline_cards', 'ma_pipline_cards.id', '=', 'ma_pipline_card_interets.card_id')
                    ->whereColumn('ma_pipline_cards.prospect_id', 'prospects.id')
                    ->where('ma_pipline_card_interets.prospect_interet_id', $interetId);
            });
        }

        if ($request->filled('etape') && $request->input('etape') !== 'all') {
            $etapeId = $request->input('etape');
            $usersQuery->whereExists(function ($sub) use ($etapeId) {
                $sub->select(DB::raw(1))
                    ->from('ma_pipline_cards')
                    ->whereColumn('ma_pipline_cards.prospect_id', 'prospects.id')
                    ->whereNull('ma_pipline_cards.user_id')
                    ->whereNotNull('ma_pipline_cards.prospect_id')
                    ->where('ma_pipline_cards.ma_pipline_etape_id', $etapeId);
            });
        }

        $actualUsers = $usersQuery->count();
        $convertedUserIds = (clone $usersQuery)->pluck('user_id')->filter()->toArray();

        $actualComptes = 0;
        $actualSolde = 0.0;

        if (!empty($convertedUserIds)) {
            $baseFacturationQuery = DB::table('facturation_vrb')
                ->whereIn('user_id', $convertedUserIds)
                ->where('paid', 1)
                ->where('objectif', 'activation-compte')
                ->where(function ($q) {
                    $q->whereNull('mode_paiement')
                      ->orWhere('mode_paiement', '!=', 'solde');
                });

            if ($start && $end) {
                $baseFacturationQuery->whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()]);
            }

            $actualComptes = (clone $baseFacturationQuery)->count();

            $actualSolde = (float) (clone $baseFacturationQuery)->sum('amount');
        }

        $openProspectIds = DB::table('prospects')
            ->whereIn('manager_users_id', $targetManagerIds)
            ->whereNull('user_id')
            ->pluck('id')
            ->toArray();

        $totalOpenProspects = count($openProspectIds);

        $activitesOuvertesCount = 0;
        $relancesRetardCount = 0;

        if (!empty($openProspectIds)) {
            $latestActivitiesIds = DB::table('ma_activites_historique')
                ->whereIn('prospect_id', $openProspectIds)
                ->select(DB::raw('MAX(id) as last_id'))
                ->groupBy('prospect_id')
                ->pluck('last_id')
                ->toArray();

            if (!empty($latestActivitiesIds)) {
                $latestActivities = DB::table('ma_activites_historique')
                    ->whereIn('id', $latestActivitiesIds)
                    ->select('id', 'prospect_id', 'need_planning', 'date', 'heure')
                    ->get();

                foreach ($latestActivities as $act) {
                    $needPlanning = (int) $act->need_planning;

                    if ($needPlanning === 0) {
                        $activitesOuvertesCount++;

                        $isExpired = false;
                        if (!empty($act->date)) {
                            $timeStr = !empty($act->heure) ? $act->heure : '23:59:59';
                            $dueDateTime = Carbon::parse($act->date . ' ' . $timeStr);

                            if ($dueDateTime->lt($now)) {
                                $isExpired = true;
                            }
                        }

                        if ($isExpired) {
                            $relancesRetardCount++;
                        }
                    } elseif ($needPlanning === 1) {
                        $relancesRetardCount++;
                    }
                }
            }
        }

        $pctUsers   = $targetUsers > 0 ? round(($actualUsers / $targetUsers) * 100, 1) : 0;
        $pctComptes = $targetComptes > 0 ? round(($actualComptes / $targetComptes) * 100, 1) : 0;
        $pctSolde   = $targetSolde > 0 ? round(($actualSolde / $targetSolde) * 100, 1) : 0;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'periode' => [
                    'key'   => $periode,
                    'label' => $periodeLabel,
                ],
                'users' => [
                    'actual'     => $actualUsers,
                    'target'     => $targetUsers,
                    'percentage' => $pctUsers,
                    'label'      => $periodeLabel,
                ],
                'comptes_pro' => [
                    'actual'     => $actualComptes,
                    'target'     => $targetComptes,
                    'percentage' => $pctComptes,
                    'label'      => $periodeLabel,
                ],
                'solde_ads' => [
                    'actual'     => $actualSolde,
                    'target'     => $targetSolde,
                    'percentage' => $pctSolde,
                    'unit'       => 'mad',
                    'label'      => $periodeLabel,
                ],
                'prospects_a_traiter' => [
                    'activites_ouvertes' => $activitesOuvertesCount,
                    'total_prospects'    => $totalOpenProspects,
                    'ratio_text'         => "{$activitesOuvertesCount}/{$totalOpenProspects}",
                    'subtitle'           => 'Avec activité ouverte',
                ],
                'relances_en_retard' => [
                    'total'                    => $relancesRetardCount,
                    'total_activites_en_cours' => $activitesOuvertesCount,
                    'subtitle'                 => 'À traiter au plus vite',
                ],
            ],
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur lors du calcul des statistiques',
            'error'   => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ], 500);
    }
}

public function getVueEnsembleCards($prospectId)
{
    $card = DB::table('ma_pipline_cards')
        ->whereNull('user_id')
        ->where('prospect_id', $prospectId)
        ->first();

    if (!$card) {
        return response()->json([
            'status' => 'error',
            'message' => 'Carte pipeline introuvable pour ce prospect.',
        ], 404);
    }

    $etape = DB::table('ma_pipline_etapes')
        ->where('id', $card->ma_pipline_etape_id)
        ->first();

    $etapeName = $etape ? $etape->name : 'Nouveau';
    $etapeScore = $etape && isset($etape->score) ? (int)$etape->score : 0;
    $etapeNameLower = mb_strtolower(trim($etapeName));

    $finalScore = 0;

    if (str_contains($etapeNameLower, 'gagn') || str_contains($etapeNameLower, 'win')) {
        $finalScore = 100;
    } elseif (str_contains($etapeNameLower, 'perdu') || str_contains($etapeNameLower, 'lost')) {
        $finalScore = 0;
    } else {
        $notesScoreSum = DB::table('ma_activites_historique as ah')
            ->join('ma_pipline_activites_notes as an', 'ah.ma_pipline_activites_notes_id', '=', 'an.id')
            ->where('ah.prospect_id', $prospectId)
            ->where('ah.need_planning', 1)
            ->sum('an.score');

        $computedScore = $etapeScore + (int)$notesScoreSum;

        $finalScore = max(0, min(100, $computedScore));
    }

    $lastNoteScore = DB::table('ma_activites_historique as ah')
        ->join('ma_pipline_activites_notes as an', 'ah.ma_pipline_activites_notes_id', '=', 'an.id')
        ->where('ah.prospect_id', $prospectId)
        ->where('ah.need_planning', 1)
        ->orderBy('ah.id', 'desc')
        ->value('an.score');

    $evolutionText = '';
    if ($lastNoteScore !== null) {
        $evolutionText = ($lastNoteScore >= 0 ? "+{$lastNoteScore}" : "{$lastNoteScore}") . " pts";
    }

    $startDate = $card->created_at ? Carbon::parse($card->created_at) : Carbon::now();
    $diffDays = (int)$startDate->diffInDays(Carbon::now());
    $dureeTexte = $diffDays === 0 ? "(Aujourd'hui)" : "({$diffDays} jour" . ($diffDays > 1 ? 's)' : ')');

    Carbon::setLocale('fr');
    $depuisDate = "Depuis le " . $startDate->translatedFormat('d M. Y');

    $totalMontant = DB::table('ma_pipline_card_interets')
        ->where('card_id', $card->id)
        ->sum('montant');

    $montantFinal = $totalMontant ? round($totalMontant) : 0;

    $lastActivite = DB::table('ma_activites_historique as ah')
        ->leftJoin('ma_pipline_activites_types as at', 'ah.ma_pipline_activites_types_id', '=', 'at.id')
        ->select('ah.*', 'at.name as type_name')
        ->where('ah.prospect_id', $prospectId)
        ->where('ah.need_planning', 1)
        ->orderBy('ah.id', 'desc')
        ->first();

    $delai = 'Aucune';
    $typeAction = '---';
    $heure = null;

    if ($lastActivite) {
        $typeAction = $lastActivite->type_name ?? 'Activité';
        $actDate = $lastActivite->date ? Carbon::parse($lastActivite->date) : Carbon::parse($lastActivite->created_at);

        if ($actDate->isToday()) {
            $delai = "Aujourd'hui";
        } elseif ($actDate->isYesterday()) {
            $delai = "Hier";
        } else {
            $delai = $actDate->translatedFormat('d M. Y');
        }

        if ($lastActivite->heure) {
            $heure = Carbon::parse($lastActivite->heure)->format('H:i');
        } elseif ($lastActivite->created_at) {
            $heure = Carbon::parse($lastActivite->created_at)->format('H:i');
        }
    }

    return response()->json([
        'status' => 'success',
        'data' => [
            'scoreOpportunite' => [
                'score' => (int)$finalScore,
                'max' => 100,
                'evolution' => $evolutionText,
                'evolutionText' => '',
            ],
            'etapeActuelle' => [
                'nom' => $etapeName,
                'depuisDate' => $depuisDate,
                'dureeTexte' => $dureeTexte,
            ],
            'montantPotentiel' => [
                'valeur' => $montantFinal,
                'devise' => 'DH',
                'sousTexte' => 'Basé sur les objectifs sélectionnés',
            ],
            'derniereInteraction' => [
                'delai' => $delai,
                'typeAction' => $typeAction,
                'heure' => $heure,
            ],
        ],
    ]);
}

public function getPipelineEtapes(Request $request): JsonResponse
{
    try {
        $etapes = DB::table('ma_pipline_etapes')
            ->select([
                'id',
                'name',
                'order',
                'color',
                'score',
            ])
            ->orderBy('order', 'asc')
            ->get();

        $currentEtapeId = null;
        $prospectId = $request->query('prospect_id');
        $userId     = $request->query('user_id');
        $etabId     = $request->query('etab_id');
        $cardId     = $request->query('card_id');

        $cardQuery = DB::table('ma_pipline_cards');

        if (!empty($cardId)) {
            $card = $cardQuery->where('id', $cardId)->first();
            $currentEtapeId = $card?->ma_pipline_etape_id;
            $userId = $userId ?: $card?->user_id;
            $etabId = $etabId ?: $card?->etablissement_id;
        } elseif (!empty($prospectId)) {
            $currentEtapeId = $cardQuery->where('prospect_id', $prospectId)->value('ma_pipline_etape_id');
        } elseif (!empty($userId)) {
            $currentEtapeId = $cardQuery->where('user_id', $userId)->value('ma_pipline_etape_id');
        } elseif (!empty($etabId)) {
            $currentEtapeId = $cardQuery->where('etablissement_id', $etabId)->value('ma_pipline_etape_id');
        }

        $hasPendingPayment = false;
        if (!empty($userId) || !empty($etabId)) {
            $facturationQuery = DB::table('facturation_vrb')
                ->where('paid', 2)
                ->whereIn('objectif', ['recharge-solde', 'activation-compte']);

            if (!empty($etabId)) {
                $facturationQuery->where('etab_id', $etabId);
            } elseif (!empty($userId)) {
                $facturationQuery->where('user_id', $userId);
            }

            $hasPendingPayment = $facturationQuery->exists();
        }

        return response()->json([
            'status'              => 'success',
            'current_etape_id'    => $currentEtapeId ? (int) $currentEtapeId : null,
            'has_pending_payment' => $hasPendingPayment,
            'data'                => $etapes,
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Erreur lors de la récupération des étapes',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

public function updateProspectEtape(Request $request, $id = null): JsonResponse
    {
        try {
            $validated = $request->validate([
                'ma_pipline_etape_id' => 'required|integer|exists:ma_pipline_etapes,id',
                'card_id'             => 'nullable|integer',
                'user_id'             => 'nullable|integer',
                'etab_id'             => 'nullable|integer',
                'prospect_id'         => 'nullable|integer',
            ]);

            $cardId    = $request->input('card_id');
            $userId    = $request->input('user_id');
            $etabId    = $request->input('etab_id');
            $prospectId = $request->input('prospect_id');

            $card = null;

            if (!empty($cardId)) {
                $card = DB::table('ma_pipline_cards')->where('id', $cardId)->first();
            }

            if (!$card && !empty($prospectId)) {
                $card = DB::table('ma_pipline_cards')
                    ->whereNull('user_id')
                    ->where('prospect_id', $prospectId)
                    ->first();
            }

            if (!$card && !empty($userId)) {
                $card = DB::table('ma_pipline_cards')
                    ->where('user_id', $userId)
                    ->first();
            }

            if (!$card && !empty($etabId)) {
                $card = DB::table('ma_pipline_cards')
                    ->where('etablissement_id', $etabId)
                    ->first();
            }

            if (!$card && !empty($id) && (int)$id > 0) {
                $card = DB::table('ma_pipline_cards')
                    ->where('prospect_id', $id)
                    ->orWhere('user_id', $id)
                    ->orWhere('etablissement_id', $id)
                    ->orWhere('id', $id)
                    ->first();
            }

            if (!$card) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Carte pipeline introuvable pour cette opportunité.',
                ], 404);
            }

            $now = Carbon::now();
            $etapeId = (int) $validated['ma_pipline_etape_id'];

            $interetStatus = match ($etapeId) {
                5       => 'gagne',
                6       => 'perdu',
                default => 'encours',
            };

            DB::table('ma_pipline_cards')
                ->where('id', $card->id)
                ->update([
                    'ma_pipline_etape_id' => $etapeId,
                    'updated_at'          => $now,
                ]);

            DB::table('ma_pipline_card_interets')
                ->where('card_id', $card->id)
                ->update([
                    'status'     => $interetStatus,
                    'updated_at' => $now,
                ]);

            $newEtape = DB::table('ma_pipline_etapes')
                ->where('id', $etapeId)
                ->first();

            return response()->json([
                'status'  => 'success',
                'message' => 'Étape mise à jour avec succès.',
                'data'    => [
                    'card_id'             => $card->id,
                    'prospect_id'         => $card->prospect_id,
                    'user_id'             => $card->user_id,
                    'etablissement_id'    => $card->etablissement_id,
                    'ma_pipline_etape_id' => $etapeId,
                    'status_interets'     => $interetStatus,
                    'etape_name'          => $newEtape ? $newEtape->name : null,
                    'etape_color'         => $newEtape ? $newEtape->color : null,
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Données invalides.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'étape.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }


}