<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserPermissionController extends Controller
{
    public function getAuthUserPermissions(Request $request): JsonResponse
    {
        try {
            $authUser = $request->user();
            $userId = $authUser ? $authUser->id : null;

            if (!$userId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Utilisateur non authentifié',
                ], 401);
            }

            $user = DB::table('manager_users')
                ->where('id', $userId)
                ->select([
                    'id',
                    'first_name',
                    'last_name',
                    'role_id',
                    'is_chef',
                    'equipe_id',
                ])
                ->first();

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Utilisateur introuvable',
                ], 404);
            }

            $roleName = null;
            if (!empty($user->role_id)) {
                $role = DB::table('ma_roles')
                    ->where('id', $user->role_id)
                    ->select('name')
                    ->first();

                $roleName = $role ? $role->name : null;
            }

            $permissions = [];
            if (!empty($user->role_id)) {
                $permissions = DB::table('ma_role_permissions')
                    ->join('ma_permissions', 'ma_permissions.id', '=', 'ma_role_permissions.permission_id')
                    ->where('ma_role_permissions.role_id', $user->role_id)
                    ->select([
                        'ma_role_permissions.permission_id',
                        'ma_permissions.name',
                        'ma_permissions.slug',
                        'ma_role_permissions.can_create',
                        'ma_role_permissions.can_update',
                        'ma_role_permissions.can_delete',
                        'ma_role_permissions.scope',
                    ])
                    ->get()
                    ->map(function ($perm) {
                        return [
                            'permission_id' => $perm->permission_id,
                            'name'          => $perm->name,
                            'slug'          => $perm->slug,
                            'can_create'    => (bool) $perm->can_create,
                            'can_update'    => (bool) $perm->can_update,
                            'can_delete'    => (bool) $perm->can_delete,
                            'scope'         => $perm->scope,
                        ];
                    })
                    ->toArray();
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'id'          => $user->id,
                    'first_name'  => $user->first_name,
                    'last_name'   => $user->last_name,
                    'role_id'     => $user->role_id,
                    'role_name'   => $roleName,
                    'is_chef'     => (bool) $user->is_chef,
                    'equipe_id'   => $user->equipe_id,
                    'permissions' => $permissions,
                ],
            ], 200);

        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la récupération des permissions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}