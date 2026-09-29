<?php

namespace App\Http\Controllers\equipe;

use App\Http\Controllers\Controller;
use App\Models\MaEquipe;
use App\Models\UserManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Throwable;
use App\Models\Activite;

class EquipeController extends Controller
{
   
    public function getEquipes(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 10);

            $query = MaEquipe::with([
                'activites:id,name',
                'managerUsers' => function ($q) {
                    $q->select([
                        'id',
                        'equipe_id',
                        'is_chef',
                        'first_name',
                        'last_name',
                        'email',
                        'role_id',
                    ]);
                }
            ]);

            // Scope « team » / « own » : uniquement l'équipe de l'utilisateur
            // (aucune s'il n'est rattaché à aucune équipe).
            $authUser = $request->user();
            $scope = $authUser->permissionFor('/equipe')['scope'];

            if ($scope !== 'all') {
                $query->where('id', $authUser->equipe_id ?? 0);
            }

            if ($request->filled('search')) {
                $query->where('nom', 'like', "%{$request->search}%");
            }

            $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $paginated->getCollection()->transform(function ($equipe) {
                $chefUser = $equipe->managerUsers->firstWhere('is_chef', 1);
                $chefData = null;

                if ($chefUser) {
                    $fullName = trim("{$chefUser->first_name} {$chefUser->last_name}");
                    $chefData = [
                        'id'     => $chefUser->id,
                        'name'   => $fullName !== '' ? $fullName : 'Chef d\'équipe',
                        'role'   => 'Manager',
                        'avatar' => null,
                    ];
                }

                $allActivites = $equipe->activites->map(function ($act) {
                    return [
                        'id'   => $act->id,
                        'name' => $act->name,
                    ];
                });

                $primaryActivite = $allActivites->first()['name'] ?? 'Général';

                $membresList = $equipe->managerUsers
                    ->where('is_chef', 0)
                    ->values()
                    ->map(function ($user) {
                        $fullName = trim("{$user->first_name} {$user->last_name}");
                        return [
                            'id'     => $user->id,
                            'name'   => $fullName !== '' ? $fullName : 'Membre',
                            'role'   => 'Commercial',
                            'avatar' => null,
                        ];
                    });

                $capacite = (int) ($equipe->capacite_leads ?? 100);

                return [
                    'id'             => $equipe->id,
                    'nom'            => $equipe->nom,
                    'color'          => $equipe->color ?? '#2563eb',
                    'status'         => ucfirst($equipe->status ?? 'Active'),
                    'capacite_leads' => $capacite,
                    'total_leads'    => 0,
                    'taux_atteinte'  => 0,
                    'chef'           => $chefData,
                    'activite'       => $primaryActivite,
                    'activites_json' => $allActivites,
                    'total_membres'  => $equipe->managerUsers->count(),
                    'membres_json'   => $membresList,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => $paginated,
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la récupération des équipes',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



    public function getCreateData(Request $request): JsonResponse
    {
        try {
            $activites = Activite::select(['id', 'name'])
                ->orderBy('name', 'asc')
                ->get();

            $usersQuery = UserManager::query()
                ->select([
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'role_id',
                    'equipe_id',
                    'is_chef',
                ])
                ->whereNull('equipe_id');

            if (method_exists(UserManager::class, 'role')) {
                $usersQuery->with('role:id,name');
            }

            $users = $usersQuery->orderBy('first_name', 'asc')->get();

            $formattedUsers = $users->map(function ($user) {
                $fullName = trim("{$user->first_name} {$user->last_name}");
                $roleName = $user->role->name ?? ($user->role_id == 1 ? 'Admin' : ($user->is_chef ? 'Manager' : 'Commercial'));

                return [
                    'id'        => $user->id,
                    'name'      => $fullName !== '' ? $fullName : $user->email,
                    'email'     => $user->email,
                    'role'      => $roleName,
                    'equipe_id' => $user->equipe_id,
                    'is_chef'   => (bool) $user->is_chef,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'activites' => $activites,
                    'users'     => $formattedUsers,
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



    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->permissionFor('/equipe')['can_create']) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Vous n\'avez pas le droit de créer une équipe.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom'            => 'required|string|max:255|unique:ma_equipes,nom',
            'responsable_id' => 'nullable|integer|exists:manager_users,id',
            'secteurs'       => 'nullable|array',
            'secteurs.*'     => 'integer|exists:activites,id',
            'membres'        => 'nullable|array',
            'membres.*'      => 'integer|exists:manager_users,id',
            'capacite_leads' => 'nullable|integer|min:0',
            'color'          => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                $equipe = MaEquipe::create([
                    'nom'            => trim($request->nom),
                    'color'          => $request->color ?? '#2563eb',
                    'capacite_leads' => $request->filled('capacite_leads') ? (int) $request->capacite_leads : 100,
                    'status'         => 'active',
                ]);

                if ($request->filled('secteurs') && is_array($request->secteurs)) {
                    $equipe->activites()->sync($request->secteurs);
                }

                if ($request->filled('responsable_id')) {
                    UserManager::where('id', $request->responsable_id)->update([
                        'equipe_id' => $equipe->id,
                        'is_chef'   => 1,
                    ]);
                }

                if ($request->filled('membres') && is_array($request->membres)) {
                    $membresIds = array_diff($request->membres, [$request->responsable_id]);
                    if (!empty($membresIds)) {
                        UserManager::whereIn('id', $membresIds)->update([
                            'equipe_id' => $equipe->id,
                            'is_chef'   => 0,
                        ]);
                    }
                }

                $equipe->load(['activites:id,name', 'managerUsers:id,equipe_id,is_chef,first_name,last_name,email']);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Équipe créée avec succès',
                    'data'    => $equipe,
                ], 201);
            });

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la création de l\'équipe',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}