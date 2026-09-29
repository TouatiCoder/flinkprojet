<?php

namespace App\Http\Controllers\RolesAndPermission;

use App\Http\Controllers\Controller;
use App\Models\MaRole;
use App\Models\MaPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaRoleController extends Controller
{
    public function index()
    {
        $roles = MaRole::select('id', 'name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles
        ], 200);
    }

    public function show($id)
{
    $role = MaRole::with('permissions')->find($id);

    if (!$role) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Role introuvable'
        ], 404);
    }

    $formattedPermissions = $role->permissions->map(function ($permission) {
        return [
            'permission_id'   => $permission->id,
            'permission_name' => $permission->name,
            'slug'            => $permission->slug,
            'can_create'      => (bool) $permission->pivot->can_create,
            'can_update'      => (bool) $permission->pivot->can_update,
            'can_delete'      => (bool) $permission->pivot->can_delete,
            'scope'           => $permission->pivot->scope,
        ];
    });

    return response()->json([
        'status' => 'success',
        'data'   => [
            'id'          => $role->id,
            'name'        => $role->name,
            'permissions' => $formattedPermissions
        ]
    ], 200);
}

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:ma_roles,name|max:255',
            'permissions' => 'nullable|array',
            'permissions.*.permission_id' => 'required|exists:ma_permissions,id',
            'permissions.*.can_create' => 'boolean',
            'permissions.*.can_update' => 'boolean',
            'permissions.*.can_delete' => 'boolean',
            'permissions.*.scope' => 'in:all,team,own',
        ]);

        DB::beginTransaction();

        try {
            $role = MaRole::create([
                'name' => $request->name,
            ]);

            if (!empty($request->permissions)) {
                $syncData = [];

                foreach ($request->permissions as $perm) {
                    $syncData[$perm['permission_id']] = [
                        'can_create' => $perm['can_create'] ?? false,
                        'can_update' => $perm['can_update'] ?? false,
                        'can_delete' => $perm['can_delete'] ?? false,
                        'scope' => $perm['scope'] ?? 'own',
                    ];
                }

                $role->permissions()->attach($syncData);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Role créé avec succès',
                'data' => $role->load('permissions')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création du rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function edit($id)
{
    $role = MaRole::with('permissions')->find($id);

    if (!$role) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Role introuvable'
        ], 404);
    }

    $assignedPermissions = $role->permissions->map(function ($permission) {
        return [
            'permission_id'   => $permission->id,
            'permission_name' => $permission->name,
            'slug'            => $permission->slug,
            'can_create'      => (bool) $permission->pivot->can_create,
            'can_update'      => (bool) $permission->pivot->can_update,
            'can_delete'      => (bool) $permission->pivot->can_delete,
            'scope'           => $permission->pivot->scope,
        ];
    });

    $allPermissions = MaPermission::select('id', 'name', 'slug')->get()->map(function ($perm) {
        return [
            'id'   => $perm->id,
            'name' => $perm->name,
            'slug' => $perm->slug,
        ];
    });

    return response()->json([
        'status' => 'success',
        'data'   => [
            'role' => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $assignedPermissions,
            ],
            'all_permissions' => $allPermissions
        ]
    ], 200);
}

    public function update(Request $request, $id)
    {
        $role = MaRole::find($id);

        if (!$role) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Role introuvable'
            ], 404);
        }

        $request->validate([
            'name'                        => 'required|string|max:255|unique:ma_roles,name,' . $id,
            'permissions'                 => 'nullable|array',
            'permissions.*.permission_id' => 'required|exists:ma_permissions,id',
            'permissions.*.can_create'    => 'boolean',
            'permissions.*.can_update'    => 'boolean',
            'permissions.*.can_delete'    => 'boolean',
            'permissions.*.scope'         => 'in:all,team,own',
        ]);

        DB::beginTransaction();

        try {
            $role->update([
                'name' => $request->name,
            ]);

            $syncData = [];

            if (!empty($request->permissions)) {
                foreach ($request->permissions as $perm) {
                    $syncData[$perm['permission_id']] = [
                        'can_create' => $perm['can_create'] ?? false,
                        'can_update' => $perm['can_update'] ?? false,
                        'can_delete' => $perm['can_delete'] ?? false,
                        'scope'      => $perm['scope'] ?? 'own',
                    ];
                }
            }

            $role->permissions()->sync($syncData);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Role mis à jour avec succès',
                'data'    => $role->load('permissions')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la mise à jour du rôle',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $role = MaRole::find($id);

        if (!$role) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Rôle introuvable'
            ], 404);
        }

        DB::beginTransaction();

        try {
            $role->permissions()->detach();

            $role->delete();

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Rôle supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors de la suppression du rôle',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}