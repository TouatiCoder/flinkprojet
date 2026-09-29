<?php

namespace App\Http\Controllers\RolesAndPermission;

use App\Http\Controllers\Controller;
use App\Models\MaPermission;
use App\Models\MaRoute;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MaPermissionController extends Controller
{

    public function index()
{
    try {
        $permissions = MaPermission::all()->map(function ($permission) {
            return [
                'id'              => $permission->id,
                'permission_name' => $permission->name,
                'slug'            => $permission->slug,
            ];
        });

        return response()->json($permissions, 200);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:ma_permissions,name',
            'slug' => 'nullable|string|max:255|unique:ma_permissions,slug',
        ]);

        $name = trim($request->name);
        $slug = $request->slug ? trim($request->slug) : Str::slug($name);

        $permission = MaPermission::create([
            'name' => $name,
            'slug' => $slug,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Permission créée avec succès!',
            'data'    => $permission
        ], 201);
    }

    public function edit($id)
    {
        $permission = MaPermission::find($id);

        if (!$permission) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Permission introuvable'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'permission' => [
                    'id'   => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                ],
            ]
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $permission = MaPermission::find($id);

        if (!$permission) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Permission introuvable'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:ma_permissions,name,' . $id,
            'slug' => 'required|string|max:255|unique:ma_permissions,slug,' . $id,
        ]);

        $permission->update([
            'name' => trim($request->name),
            'slug' => trim($request->slug),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Permission modifiée avec succès!',
            'data'    => $permission
        ], 200);
    }

    public function destroy($id)
    {
        $permission = MaPermission::findOrFail($id);
        $permission->delete();

        return response()->json(['message' => 'Permission supprimée avec succès!'], 200);
    }
}