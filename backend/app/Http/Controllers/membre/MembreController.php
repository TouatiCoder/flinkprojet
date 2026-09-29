<?php

namespace App\Http\Controllers\membre;

use App\Http\Controllers\Controller;
use App\Models\MaEquipe;
use App\Models\Activite;
use App\Models\UserManager;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Throwable;

class MembreController extends Controller
{
    /**
     * Contraintes réelles de la table `manager_users`. MySQL tourne en mode
     * STRICT_TRANS_TABLES : une valeur trop longue déclenche une erreur SQL
     * 1406 au lieu d'être tronquée. La validation est donc alignée sur le
     * schéma afin de renvoyer une 422 explicite par champ, pas une 500.
     */
    private const MAX_NAME_PART   = 50;   // first_name / last_name : varchar(50)
    private const MAX_NOM_COMPLET = 100;  // first_name + last_name
    private const MAX_EMAIL       = 50;   // email     : varchar(50)
    private const MAX_TELEPHONE   = 20;   // telephone : varchar(20)
    private const MAX_USERNAME    = 50;   // username  : varchar(50) UNIQUE

    /**
     * Étapes clôturées du pipeline (table `ma_pipline_etapes`).
     */
    private const ETAPE_GAGNE = 5;
    private const ETAPE_PERDU = 6;

    /**
     * Get all form dependencies for creating or editing a member.
     */
    public function getFormDependencies(): JsonResponse
    {
        try {
            $villes = DB::table('villes')
                ->whereIn('id', [7, 8, 9, 21])
                ->select('id', 'name')
                ->get();

            $equipes = MaEquipe::with([
                'chef' => function ($query) {
                    $query->select([
                        'id',
                        'equipe_id',
                        'first_name',
                        'last_name',
                        'email',
                        'is_chef'
                    ]);
                }
            ])
            ->select('id', 'nom', 'color')
            ->orderBy('nom', 'asc')
            ->get()
            ->map(function ($equipe) {
                $chef = $equipe->chef;
                $responsableName = null;
                $responsableId = null;

                if ($chef) {
                    $fullName = trim("{$chef->first_name} {$chef->last_name}");
                    $responsableName = $fullName !== '' ? $fullName : $chef->email;
                    $responsableId = $chef->id;
                }

                return [
                    'id'               => $equipe->id,
                    'nom'              => $equipe->nom,
                    'color'            => $equipe->color ?? '#2563eb',
                    'responsable_id'   => $responsableId,
                    'responsable_name' => $responsableName,
                ];
            });

            $roles = DB::table('ma_roles')
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get();

            $activites = Activite::select('id', 'name')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'villes'    => $villes,
                    'equipes'   => $equipes,
                    'roles'     => $roles,
                    'activites' => $activites,
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

    /**
     * Get all members without server-side filtering or pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = UserManager::with(['role', 'equipe', 'activites']);
            $this->appliquerScope($query, $request->user());

            $membres = $query->orderBy('id', 'desc')->get();

            $chefsParEquipe = UserManager::where('is_chef', 1)
                ->whereNotNull('equipe_id')
                ->select('id', 'first_name', 'last_name', 'avatar', 'equipe_id')
                ->get()
                ->keyBy('equipe_id');

            // Indicateurs réels (opportunités, relances, objectifs réalisés)
            // calculés en une seule passe pour l'ensemble des membres.
            $stats = $this->computeMembresStats($membres->pluck('id')->all());

            $formattedData = $membres->map(function ($user) use ($chefsParEquipe, $stats) {
                $nomComplet = trim("{$user->first_name} {$user->last_name}");
                $roleName = $user->role ? $user->role->name : 'Commercial';

                $equipeObj = null;
                $equipesAccessibles = [];
                if ($user->equipe) {
                    $equipeObj = [
                        'id'    => $user->equipe->id,
                        'nom'   => $user->equipe->nom,
                        'color' => $user->equipe->color ?? '#8b5cf6',
                    ];
                    $equipesAccessibles[] = $equipeObj;
                }

                $stat = $stats[$user->id] ?? $this->emptyStats();

                return [
                    'id'                  => $user->id,
                    'nom_complet'         => $nomComplet !== '' ? $nomComplet : $user->email,
                    'email'               => $user->email,
                    'telephone'           => $user->telephone,
                    'avatar'              => $this->absoluteAvatarUrl($user->avatar),
                    'role'                => [
                        'id'   => $user->role_id,
                        'name' => $roleName,
                        'type' => strtolower($roleName),
                    ],
                    'equipe_principale'   => $equipeObj,
                    'responsable'         => $this->resolveResponsable($user, $chefsParEquipe),
                    'equipes_accessibles' => $equipesAccessibles,
                    'secteurs'            => $user->activites->pluck('name')->toArray(),
                    'secteur_ids'         => $user->activites->pluck('id')->toArray(),
                    'leads_actifs'        => $stat['leads_actifs'],
                    'capacite_max_leads'  => (int) ($user->capacite_max_leads ?? 0),
                    'retards'             => $stat['relances_en_retard'],
                    'devenir_user'        => $this->buildMetric(
                        $stat['realise']['users_convertis'],
                        (float) ($user->objectif_users_jour ?? 0)
                    ),
                    'compte_pro'          => $this->buildMetric(
                        $stat['realise']['comptes_pro'],
                        (float) ($user->objectif_comptes_mois ?? 0)
                    ),
                    'solde_ads'           => $this->buildMetric(
                        $stat['realise']['solde_ads'],
                        (float) ($user->objectif_solde_an ?? 0)
                    ),
                    'is_active'           => (int) $user->is_active,
                    'created_at'          => $user->created_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => $formattedData,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des membres',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created member.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->permissionFor('/membres')['can_create']) {
            return $this->refus('Vous n\'avez pas le droit d\'ajouter un membre.');
        }

        $validator = Validator::make($request->all(), $this->validationRules());

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                [$firstName, $lastName] = $this->splitNomComplet($request->nom_complet);

                $isActive = strtolower($request->input('status', 'actif')) === 'actif' ? 1 : 0;

                $objectifs = $request->input('objectifs', []);
                $objUsers   = (int) ($objectifs['users_convertis'] ?? 0);
                $objComptes = (int) ($objectifs['comptes_pro'] ?? 0);
                $objSolde   = (float) ($objectifs['solde_ads'] ?? 0.00);

                $avatarPath = $this->uploadAvatar($request->avatar);

                $user = UserManager::create([
                    'first_name'            => $firstName,
                    'last_name'             => $lastName,
                    'username'              => $this->generateUsername($request->email),
                    'email'                 => trim($request->email),
                    'password'              => Hash::make($request->password),
                    'telephone'             => $request->telephone,
                    'avatar'                => $avatarPath,
                    'ville_id'              => $request->ville_id,
                    'is_active'             => $isActive,
                    'equipe_id'             => $request->equipe_id,
                    'role_id'               => $request->role_id,
                    'is_chef'               => 0,
                    'capacite_max_leads'    => (int) ($request->capacite_max_leads ?? 0),
                    'nb_prospect_par_jour'  => (int) ($request->input('limite_prospection') ?? 0),
                    'methode_affectation'   => $request->input('methode_affectation'),
                    'is_managing'           => $request->has('is_managing')
                        ? $request->boolean('is_managing')
                        : false,
                    'objectif_users_jour'   => $objUsers,
                    'objectif_comptes_mois' => $objComptes,
                    'objectif_solde_an'     => $objSolde,
                ]);

                if ($request->filled('secteurs') && is_array($request->secteurs)) {
                    $user->activites()->sync(array_unique($request->secteurs));
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Membre ajouté avec succès',
                    'data'    => $user->load('activites'),
                ], 201);
            });

        } catch (Throwable $e) {
            Log::error('Membres - echec creation', [
                'email'     => $request->input('email'),
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de l\'ajout du membre',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display single member details.
     *
     * Renvoie toutes les données réellement disponibles en base pour la page
     * « Afficher un membre » : identité, affectation, capacité, objectifs
     * (cible + réalisé), KPI d'opportunités et activités récentes.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            // Hors scope = 404, comme un membre inexistant : on ne révèle pas
            // l'existence d'un membre que l'utilisateur ne peut pas voir.
            $query = UserManager::with(['role', 'equipe', 'activites']);
            $this->appliquerScope($query, $request->user());

            $user = $query->find($id);

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Membre non trouvé',
                ], 404);
            }

            $chefsParEquipe = UserManager::where('is_chef', 1)
                ->whereNotNull('equipe_id')
                ->select('id', 'first_name', 'last_name', 'avatar', 'equipe_id')
                ->get()
                ->keyBy('equipe_id');

            $ville = $user->ville_id
                ? DB::table('villes')->select('id', 'name')->where('id', $user->ville_id)->first()
                : null;

            $stats = $this->computeMembresStats([$user->id]);
            $stat  = $stats[$user->id] ?? $this->emptyStats();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    // ------------------------------------------------------
                    // Identité — champs déjà consommés par le formulaire
                    // d'édition : noms et formats inchangés.
                    // ------------------------------------------------------
                    'id'                  => $user->id,
                    'nom_complet'         => trim("{$user->first_name} {$user->last_name}"),
                    'first_name'          => $user->first_name,
                    'last_name'           => $user->last_name,
                    'username'            => $user->username,
                    'email'               => $user->email,
                    'telephone'           => $user->telephone,
                    'avatar'              => $this->absoluteAvatarUrl($user->avatar),
                    'ville_id'            => $user->ville_id,
                    'equipe_id'           => $user->equipe_id,
                    'role_id'             => $user->role_id,
                    'is_active'           => $user->is_active ? 'actif' : 'inactif',
                    'capacite_max_leads'  => (int) $user->capacite_max_leads,
                    'secteurs'            => $user->activites->pluck('id')->toArray(),
                    'objectifs'           => [
                        'users_convertis' => (int) $user->objectif_users_jour,
                        'comptes_pro'     => (int) $user->objectif_comptes_mois,
                        'solde_ads'       => (float) $user->objectif_solde_an,
                    ],

                    // ------------------------------------------------------
                    // Libellés résolus (page de détail)
                    // ------------------------------------------------------
                    'ville'               => $ville
                        ? ['id' => $ville->id, 'name' => $ville->name]
                        : null,
                    'role'                => [
                        'id'   => $user->role_id,
                        'name' => $user->role ? $user->role->name : null,
                    ],
                    'equipe'              => $user->equipe ? [
                        'id'    => $user->equipe->id,
                        'nom'   => $user->equipe->nom,
                        'color' => $user->equipe->color ?? '#8b5cf6',
                    ] : null,
                    'responsable'         => $this->resolveResponsable($user, $chefsParEquipe),
                    'secteurs_noms'       => $user->activites->pluck('name')->toArray(),
                    'created_at'          => $user->created_at,

                    // ------------------------------------------------------
                    // Paramètres d'affectation.
                    //
                    // `notes_internes` n'a pas de colonne en base : renvoyé à
                    // null (affiché « Aucune note » côté front) plutôt
                    // qu'inventé.
                    // ------------------------------------------------------
                    'limite_prospection'    => (int) ($user->nb_prospect_par_jour ?? 0),
                    'methode_affectation'   => $user->methode_affectation,
                    'is_managing'           => (bool) $user->is_managing,
                    'notes_internes'        => null,

                    // ------------------------------------------------------
                    // KPI réels
                    // ------------------------------------------------------
                    'leads_actifs'        => $stat['leads_actifs'],
                    'kpis'                => [
                        'relances_en_retard'                 => $stat['relances_en_retard'],
                        'opportunites_gagnees'               => $stat['opportunites_gagnees'],
                        'opportunites_gagnees_evolution_pct' => $stat['opportunites_gagnees_evolution_pct'],
                        'opportunites_perdues'               => $stat['opportunites_perdues'],
                        'opportunites_perdues_evolution_pct' => $stat['opportunites_perdues_evolution_pct'],
                    ],
                    'objectifs_realises'  => $stat['realise'],
                    'activites_recentes'  => $this->recentActivities((int) $user->id),
                ],
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération du membre',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update member details.
     */
    public function update(Request $request, $id): JsonResponse
    {
        if (!$request->user()->permissionFor('/membres')['can_update']) {
            return $this->refus('Vous n\'avez pas le droit de modifier un membre.');
        }

        $query = UserManager::query();
        $this->appliquerScope($query, $request->user());

        $user = $query->find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Membre non trouvé',
            ], 404);
        }

        $validator = Validator::make($request->all(), $this->validationRules((int) $id));

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $user) {
                [$firstName, $lastName] = $this->splitNomComplet($request->nom_complet);

                $isActive = strtolower($request->input('status', 'actif')) === 'actif' ? 1 : 0;

                $objectifs = $request->input('objectifs', []);

                $updateData = [
                    'first_name'         => $firstName,
                    'last_name'          => $lastName,
                    'email'              => trim($request->email),
                    'telephone'          => $request->telephone,
                    'ville_id'           => $request->ville_id,
                    'is_active'          => $isActive,
                    'equipe_id'          => $request->equipe_id,
                    'role_id'            => $request->role_id,
                    'capacite_max_leads' => (int) ($request->capacite_max_leads ?? 0),
                ];

                if ($request->has('limite_prospection')) {
                    $updateData['nb_prospect_par_jour'] = (int) ($request->input('limite_prospection') ?? 0);
                }

                if ($request->has('methode_affectation')) {
                    $updateData['methode_affectation'] = $request->input('methode_affectation');
                }

                if ($request->has('is_managing')) {
                    $updateData['is_managing'] = $request->boolean('is_managing');
                }

                if ($request->filled('password')) {
                    $updateData['password'] = Hash::make($request->password);
                }

                if (isset($objectifs['users_convertis'])) {
                    $updateData['objectif_users_jour'] = (int) $objectifs['users_convertis'];
                }
                if (isset($objectifs['comptes_pro'])) {
                    $updateData['objectif_comptes_mois'] = (int) $objectifs['comptes_pro'];
                }
                if (isset($objectifs['solde_ads'])) {
                    $updateData['objectif_solde_an'] = (float) $objectifs['solde_ads'];
                }

                // L'avatar est optionnel : trois cas possibles quand le champ
                // "avatar" est présent dans la requête.
                //   1) Nouvelle photo (base64 "data:image/...")  -> on
                //      supprime l'ancien fichier (s'il existe) et on
                //      enregistre le nouveau.
                //   2) Valeur vide/null envoyée explicitement -> le membre a
                //      supprimé sa photo côté formulaire : on supprime le
                //      fichier existant et on met la colonne à null.
                //   3) URL déjà existante renvoyée telle quelle (le membre
                //      n'a rien changé) -> on ne touche à rien.
                if ($request->has('avatar')) {
                    if ($request->filled('avatar') && str_starts_with($request->avatar, 'data:image')) {
                        $this->deleteAvatarFile($user->avatar);
                        $updateData['avatar'] = $this->uploadAvatar($request->avatar);
                    } elseif (!$request->filled('avatar')) {
                        $this->deleteAvatarFile($user->avatar);
                        $updateData['avatar'] = null;
                    }
                }

                $user->update($updateData);

                if ($request->has('secteurs') && is_array($request->secteurs)) {
                    $user->activites()->sync(array_unique($request->secteurs));
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Membre mis à jour avec succès',
                    'data'    => $user->load('activites'),
                ], 200);
            });

        } catch (Throwable $e) {
            Log::error('Membres - echec modification', [
                'membre_id' => $id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la modification du membre',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the member's avatar only (used by the "delete photo" button in
     * the edit form, without requiring a full form submit). Deletes the
     * stored file (if any) and clears the "avatar" column.
     */
    public function removeAvatar(Request $request, $id): JsonResponse
    {
        if (!$request->user()->permissionFor('/membres')['can_update']) {
            return $this->refus('Vous n\'avez pas le droit de modifier un membre.');
        }

        try {
            $query = UserManager::query();
            $this->appliquerScope($query, $request->user());

            $user = $query->find($id);

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Membre non trouvé',
                ], 404);
            }

            $this->deleteAvatarFile($user->avatar);

            $user->update(['avatar' => null]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Avatar supprimé avec succès',
                'data'    => $user->fresh(),
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la suppression de l\'avatar',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    /**
     * Règles partagées par store() et update().
     *
     * Les longueurs maximales reprennent exactement celles de la table
     * `manager_users` et `role_id` est requis car la colonne est NOT NULL.
     */
    private function validationRules(?int $ignoreId = null): array
    {
        $emailUnique = 'unique:manager_users,email' . ($ignoreId ? ',' . $ignoreId : '');

        return [
            'nom_complet'               => 'required|string|max:' . self::MAX_NOM_COMPLET,
            'email'                     => 'required|email|max:' . self::MAX_EMAIL . '|' . $emailUnique,
            'password'                  => ($ignoreId ? 'nullable' : 'required') . '|string|min:6',
            'telephone'                 => 'nullable|string|max:' . self::MAX_TELEPHONE,
            'avatar'                    => 'nullable|string',
            'ville_id'                  => 'nullable|integer|exists:villes,id',
            'status'                    => 'nullable|string|in:actif,inactif',
            'equipe_id'                 => 'nullable|integer|exists:ma_equipes,id',
            'role_id'                   => 'required|integer|exists:ma_roles,id',
            'capacite_max_leads'        => 'nullable|integer|min:0',
            'limite_prospection'        => 'nullable|integer|min:0',
            'methode_affectation'       => 'nullable|string|max:30',
            'is_managing'               => 'nullable|boolean',
            'secteurs'                  => 'nullable|array',
            'secteurs.*'                => 'integer|exists:activites,id',
            'objectifs'                 => 'nullable|array',
            'objectifs.users_convertis' => 'nullable|integer|min:0',
            'objectifs.comptes_pro'     => 'nullable|integer|min:0',
            'objectifs.solde_ads'       => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Découpe « Prénom Nom » en respectant la taille des colonnes.
     *
     * @return array{0:string,1:string}
     */
    private function splitNomComplet(?string $nomComplet): array
    {
        $parts = explode(' ', trim((string) $nomComplet), 2);

        return [
            mb_substr($parts[0] ?? '', 0, self::MAX_NAME_PART),
            mb_substr($parts[1] ?? '', 0, self::MAX_NAME_PART),
        ];
    }

    /**
     * Construit un username unique dérivé de l'email, borné à varchar(50).
     */
    private function generateUsername(string $email): string
    {
        $base = preg_replace('/[^a-z0-9_]/', '', strtolower(explode('@', $email)[0]));
        $base = $base !== '' ? $base : 'membre';
        $base = mb_substr($base, 0, self::MAX_USERNAME - 6);

        $username = $base;
        $suffix = 1;

        while (UserManager::where('username', $username)->exists()) {
            $username = $base . '_' . $suffix;
            $suffix++;
        }

        return $username;
    }

    // =====================================================================
    // STATISTIQUES (données réelles, aucune valeur simulée)
    // =====================================================================

    /**
     * Structure neutre pour un membre sans aucune donnée rattachée.
     */
    private function emptyStats(): array
    {
        return [
            'leads_actifs'                       => 0,
            'relances_en_retard'                 => 0,
            'opportunites_gagnees'               => 0,
            'opportunites_gagnees_evolution_pct' => null,
            'opportunites_perdues'               => 0,
            'opportunites_perdues_evolution_pct' => null,
            'realise'                            => [
                'users_convertis' => 0,
                'comptes_pro'     => 0,
                'solde_ads'       => 0.0,
            ],
        ];
    }

    /**
     * Calcule, pour une liste de membres, les indicateurs affichés par la
     * liste et par la page de détail.
     *
     * Sources :
     *  - opportunités       : `ma_pipline_cards` des prospects du membre
     *  - relances en retard : dernière ligne de `ma_activites_historique`
     *  - users convertis    : `prospects.user_id` renseigné
     *  - comptes pro / ads  : `facturation_vrb` (paiements encaissés)
     *
     * La logique reprend celle de ProspectController@getStatsCards.
     *
     * @param  array<int,int>  $managerIds
     * @return array<int,array>
     */
    private function computeMembresStats(array $managerIds): array
    {
        $result = [];

        foreach ($managerIds as $managerId) {
            $result[$managerId] = $this->emptyStats();
        }

        if (empty($managerIds)) {
            return $result;
        }

        $now = Carbon::now();

        $semaineDebut     = $now->copy()->startOfWeek();
        $semaineFin       = $now->copy()->endOfWeek();
        $semainePrecDebut = $now->copy()->subWeek()->startOfWeek();
        $semainePrecFin   = $now->copy()->subWeek()->endOfWeek();
        $moisDebut        = $now->copy()->startOfMonth();
        $moisFin          = $now->copy()->endOfMonth();
        $anneeDebut       = $now->copy()->startOfYear();
        $anneeFin         = $now->copy()->endOfYear();

        $gagneesPrec = [];
        $perduesPrec = [];

        // ------------------------------------------------------------------
        // Prospects rattachés aux membres
        // ------------------------------------------------------------------
        $prospects = DB::table('prospects')
            ->whereIn('manager_users_id', $managerIds)
            ->select('id', 'manager_users_id', 'user_id', 'created_at')
            ->get();

        if ($prospects->isEmpty()) {
            return $result;
        }

        $prospectsParManager = $prospects->groupBy('manager_users_id');
        $managerParProspect  = $prospects->pluck('manager_users_id', 'id');

        // ------------------------------------------------------------------
        // Opportunités (cartes pipeline des prospects)
        // ------------------------------------------------------------------
        $cards = DB::table('ma_pipline_cards')
            ->whereNull('user_id')
            ->whereIn('prospect_id', $prospects->pluck('id')->all())
            ->select('id', 'prospect_id', 'ma_pipline_etape_id', 'updated_at')
            ->get();

        foreach ($cards as $card) {
            $managerId = $managerParProspect[$card->prospect_id] ?? null;

            if (!$managerId || !isset($result[$managerId])) {
                continue;
            }

            $etapeId = (int) $card->ma_pipline_etape_id;

            if ($etapeId !== self::ETAPE_GAGNE && $etapeId !== self::ETAPE_PERDU) {
                $result[$managerId]['leads_actifs']++;
                continue;
            }

            if (!$card->updated_at) {
                continue;
            }

            $date = Carbon::parse($card->updated_at);

            $cetteSemaine = $date->between($semaineDebut, $semaineFin);
            $semainePrec  = $date->between($semainePrecDebut, $semainePrecFin);

            if ($etapeId === self::ETAPE_GAGNE) {
                if ($cetteSemaine) {
                    $result[$managerId]['opportunites_gagnees']++;
                }
                if ($semainePrec) {
                    $gagneesPrec[$managerId] = ($gagneesPrec[$managerId] ?? 0) + 1;
                }
            } else {
                if ($cetteSemaine) {
                    $result[$managerId]['opportunites_perdues']++;
                }
                if ($semainePrec) {
                    $perduesPrec[$managerId] = ($perduesPrec[$managerId] ?? 0) + 1;
                }
            }
        }

        // ------------------------------------------------------------------
        // Relances en retard : dernière activité de chaque prospect ouvert
        // ------------------------------------------------------------------
        $prospectsOuvertsIds = $prospects
            ->filter(function ($p) {
                return $p->user_id === null;
            })
            ->pluck('id')
            ->all();

        if (!empty($prospectsOuvertsIds)) {
            $dernieresIds = DB::table('ma_activites_historique')
                ->whereIn('prospect_id', $prospectsOuvertsIds)
                ->select(DB::raw('MAX(id) as last_id'))
                ->groupBy('prospect_id')
                ->pluck('last_id')
                ->all();

            if (!empty($dernieresIds)) {
                $dernieres = DB::table('ma_activites_historique')
                    ->whereIn('id', $dernieresIds)
                    ->select('prospect_id', 'need_planning', 'date', 'heure')
                    ->get();

                foreach ($dernieres as $activite) {
                    $managerId = $managerParProspect[$activite->prospect_id] ?? null;

                    if (!$managerId || !isset($result[$managerId])) {
                        continue;
                    }

                    // need_planning = 1 : activité clôturée sans prochaine
                    // action planifiée, elle reste donc à traiter.
                    if ((int) $activite->need_planning === 1) {
                        $result[$managerId]['relances_en_retard']++;
                        continue;
                    }

                    if (empty($activite->date)) {
                        continue;
                    }

                    $echeance = Carbon::parse(
                        $activite->date . ' ' . (!empty($activite->heure) ? $activite->heure : '23:59:59')
                    );

                    if ($echeance->lt($now)) {
                        $result[$managerId]['relances_en_retard']++;
                    }
                }
            }
        }

        // ------------------------------------------------------------------
        // Objectif « Devenir User » : prospects convertis sur la semaine
        // ------------------------------------------------------------------
        $convertisParManager = [];

        foreach ($prospectsParManager as $managerId => $liste) {
            if (!isset($result[$managerId])) {
                continue;
            }

            $convertis = $liste->filter(function ($p) {
                return $p->user_id !== null;
            });

            $convertisParManager[$managerId] = $convertis->pluck('user_id')->all();

            $result[$managerId]['realise']['users_convertis'] = $convertis
                ->filter(function ($p) use ($semaineDebut, $semaineFin) {
                    return $p->created_at
                        && Carbon::parse($p->created_at)->between($semaineDebut, $semaineFin);
                })
                ->count();
        }

        // ------------------------------------------------------------------
        // Objectifs « Compte Pro » (mois) et « Solde Ads » (année)
        // ------------------------------------------------------------------
        $tousUserIds = collect($convertisParManager)
            ->flatten()
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (!empty($tousUserIds)) {
            $facturations = DB::table('facturation_vrb')
                ->whereIn('user_id', $tousUserIds)
                ->where('paid', 1)
                ->whereIn('objectif', ['activation-compte', 'recharge-solde'])
                ->select('user_id', 'objectif', 'amount', 'created_at', 'mode_paiement')
                ->get();

            foreach ($convertisParManager as $managerId => $userIds) {
                if (!isset($result[$managerId]) || empty($userIds)) {
                    continue;
                }

                $lignes = $facturations->whereIn('user_id', $userIds);

                $result[$managerId]['realise']['comptes_pro'] = $lignes
                    ->filter(function ($f) use ($moisDebut, $moisFin) {
                        return $f->objectif === 'activation-compte'
                            && $f->mode_paiement !== 'solde'
                            && $f->created_at
                            && Carbon::parse($f->created_at)->between($moisDebut, $moisFin);
                    })
                    ->count();

                $result[$managerId]['realise']['solde_ads'] = (float) $lignes
                    ->filter(function ($f) use ($anneeDebut, $anneeFin) {
                        return $f->objectif === 'recharge-solde'
                            && $f->created_at
                            && Carbon::parse($f->created_at)->between($anneeDebut, $anneeFin);
                    })
                    ->sum('amount');
            }
        }

        // ------------------------------------------------------------------
        // Évolutions hebdomadaires
        // ------------------------------------------------------------------
        foreach ($result as $managerId => $stat) {
            $result[$managerId]['opportunites_gagnees_evolution_pct'] = $this->evolutionPct(
                $stat['opportunites_gagnees'],
                $gagneesPrec[$managerId] ?? 0
            );

            $result[$managerId]['opportunites_perdues_evolution_pct'] = $this->evolutionPct(
                $stat['opportunites_perdues'],
                $perduesPrec[$managerId] ?? 0
            );
        }

        return $result;
    }

    /**
     * Évolution en % entre deux périodes.
     * Renvoie null quand la période de référence est vide : aucune évolution
     * n'est calculable, le front n'affiche alors rien.
     */
    private function evolutionPct(float $actuel, float $precedent): ?float
    {
        if ($precedent <= 0) {
            return null;
        }

        return round((($actuel - $precedent) / $precedent) * 100, 1);
    }

    /**
     * Métrique « réalisé / objectif » des colonnes de la liste.
     */
    private function buildMetric(float $actuel, float $objectif): array
    {
        return [
            'actuel'      => $actuel == (int) $actuel ? (int) $actuel : round($actuel, 2),
            'objectif'    => $objectif == (int) $objectif ? (int) $objectif : round($objectif, 2),
            'pourcentage' => $objectif > 0
                ? (int) min(100, round(($actuel / $objectif) * 100))
                : 0,
        ];
    }

    /**
     * Dernières activités réalisées par le membre (need_planning = 1), avec la
     * prochaine action planifiée pour le même prospect lorsqu'elle existe.
     */
    private function recentActivities(int $managerId, int $limit = 8): array
    {
        $activites = DB::table('ma_activites_historique as ah')
            ->leftJoin('ma_pipline_activites_types as at', 'at.id', '=', 'ah.ma_pipline_activites_types_id')
            ->leftJoin('ma_pipline_activites_notes as an', 'an.id', '=', 'ah.ma_pipline_activites_notes_id')
            ->leftJoin('prospects as p', 'p.id', '=', 'ah.prospect_id')
            ->where('ah.manager_users_id', $managerId)
            ->where('ah.need_planning', 1)
            ->orderBy('ah.id', 'desc')
            ->limit($limit)
            ->select(
                'ah.id',
                'ah.date',
                'ah.heure',
                'ah.prospect_id',
                'at.name as type_name',
                'an.note as resultat_label',
                'p.nom',
                'p.prenom',
                'p.name_entreprise'
            )
            ->get();

        if ($activites->isEmpty()) {
            return [];
        }

        $prospectIds = $activites->pluck('prospect_id')->filter()->unique()->values()->all();

        // Référence de l'opportunité liée au prospect.
        $cardsParProspect = empty($prospectIds)
            ? collect()
            : DB::table('ma_pipline_cards')
                ->whereNull('user_id')
                ->whereIn('prospect_id', $prospectIds)
                ->select('id', 'prospect_id')
                ->get()
                ->keyBy('prospect_id');

        // Prochaines actions planifiées (need_planning = 0).
        $planifiees = empty($prospectIds)
            ? collect()
            : DB::table('ma_activites_historique')
                ->whereIn('prospect_id', $prospectIds)
                ->where('need_planning', 0)
                ->orderBy('id', 'asc')
                ->select('id', 'prospect_id', 'date', 'heure')
                ->get()
                ->groupBy('prospect_id');

        return $activites->map(function ($activite) use ($cardsParProspect, $planifiees) {
            $prochaine = null;

            $suivantes = $planifiees[$activite->prospect_id] ?? collect();

            foreach ($suivantes as $planifiee) {
                if ($planifiee->id > $activite->id && !empty($planifiee->date)) {
                    $prochaine = trim($planifiee->date . ' ' . ($planifiee->heure ?? ''));
                    break;
                }
            }

            $card = $cardsParProspect[$activite->prospect_id] ?? null;

            $prospectNom = trim((string) $activite->name_entreprise);

            if ($prospectNom === '') {
                $prospectNom = trim(trim((string) $activite->prenom) . ' ' . trim((string) $activite->nom));
            }

            return [
                'id'               => $activite->id,
                'date'             => $activite->date,
                'heure'            => $activite->heure,
                'type'             => $this->normalizeActiviteType($activite->type_name),
                'type_label'       => $activite->type_name,
                'prospect'         => $prospectNom !== '' ? $prospectNom : null,
                'opportunite_ref'  => $card ? 'OPP-' . $card->id : null,
                'resultat'         => $this->normalizeResultat($activite->resultat_label),
                'resultat_label'   => $activite->resultat_label ? trim($activite->resultat_label) : null,
                'prochaine_action' => $prochaine,
            ];
        })->values()->all();
    }

    /**
     * Convertit le libellé du type d'activité en clé connue du front.
     * Renvoie null si le type n'est pas reconnu : le libellé brut est alors
     * affiché tel quel.
     */
    private function normalizeActiviteType(?string $label): ?string
    {
        $value = $this->asciiLower($label);

        if ($value === '') {
            return null;
        }

        if (str_contains($value, 'appel')) {
            return 'appel';
        }
        if (str_contains($value, 'whatsapp')) {
            return 'whatsapp';
        }
        if (str_contains($value, 'mail')) {
            return 'email';
        }
        if (str_contains($value, 'demo')) {
            return 'demo';
        }

        return null;
    }

    /**
     * Convertit le résultat (note de l'activité) en clé connue du front.
     * Renvoie null si le résultat n'entre dans aucune catégorie : le libellé
     * réel est alors affiché sans style particulier.
     */
    private function normalizeResultat(?string $label): ?string
    {
        $value = $this->asciiLower($label);

        if ($value === '') {
            return null;
        }

        if (str_contains($value, 'pas interesse')) {
            return 'pas_interesse';
        }
        if (str_contains($value, 'interesse')) {
            return 'interesse';
        }
        if (str_contains($value, 'reponse recue')) {
            return 'reponse_recue';
        }
        if (str_contains($value, 'relancer') || str_contains($value, 'rappeler')) {
            return 'a_relancer';
        }

        return null;
    }

    /**
     * Minuscule sans accent, pour comparer des libellés saisis en base.
     */
    private function asciiLower(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        $value = mb_strtolower(trim($value));

        return strtr($value, [
            'à' => 'a', 'â' => 'a', 'ä' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'î' => 'i', 'ï' => 'i',
            'ô' => 'o', 'ö' => 'o',
            'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c',
        ]);
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    /**
     * Restreint la requête aux membres visibles selon le scope de la
     * permission « /membres » :
     *  - all  : tous les membres ;
     *  - team : les membres de son équipe (soi-même si aucune équipe) ;
     *  - own  : soi-même uniquement.
     */
    private function appliquerScope($query, UserManager $authUser): void
    {
        $scope = $authUser->permissionFor('/membres')['scope'];

        if ($scope === 'all') {
            return;
        }

        if ($scope === 'team' && $authUser->equipe_id) {
            $query->where('equipe_id', $authUser->equipe_id);
            return;
        }

        $query->where('id', $authUser->id);
    }

    private function refus(string $message): JsonResponse
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
        ], 403);
    }

    /**
     * Responsable = chef de l'équipe du membre.
     * Un membre n'est pas son propre responsable : null dans ce cas.
     */
    private function resolveResponsable($user, $chefsParEquipe): ?array
    {
        if (!$user->equipe_id || !isset($chefsParEquipe[$user->equipe_id])) {
            return null;
        }

        $chef = $chefsParEquipe[$user->equipe_id];

        if ((int) $chef->id === (int) $user->id) {
            return null;
        }

        return [
            'id'     => $chef->id,
            'nom'    => trim("{$chef->first_name} {$chef->last_name}"),
            'avatar' => $this->absoluteAvatarUrl($chef->avatar),
        ];
    }

    /**
     * Transforme un chemin d'avatar stocké en URL absolue.
     */
    private function absoluteAvatarUrl(?string $avatar): ?string
    {
        if (!$avatar) {
            return null;
        }

        return str_starts_with($avatar, 'http') ? $avatar : url($avatar);
    }

    /**
     * Supprime le fichier avatar présent sur le disque, s'il existe.
     */
    private function deleteAvatarFile(?string $avatar): void
    {
        if ($avatar && !str_starts_with($avatar, 'http') && File::exists(public_path($avatar))) {
            File::delete(public_path($avatar));
        }
    }

    /**
     * Internal helper to upload Base64 images.
     */
    private function uploadAvatar(?string $base64Image): ?string
    {
        if (!$base64Image || !str_starts_with($base64Image, 'data:image')) {
            return null;
        }

        $imageParts = explode(';base64,', $base64Image);
        $imageTypeAux = explode('image/', $imageParts[0]);
        $imageType = $imageTypeAux[1] ?? 'png';
        $imageBase64 = base64_decode($imageParts[1]);

        $destinationPath = public_path('uploads/avatars');
        if (!File::isDirectory($destinationPath)) {
            File::makeDirectory($destinationPath, 0777, true, true);
        }

        $fileName = 'avatar_' . uniqid() . '_' . time() . '.' . $imageType;
        file_put_contents($destinationPath . '/' . $fileName, $imageBase64);

        return '/uploads/avatars/' . $fileName;
    }
}
