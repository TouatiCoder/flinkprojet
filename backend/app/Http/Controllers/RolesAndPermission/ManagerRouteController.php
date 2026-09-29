<?php

namespace App\Http\Controllers\RolesAndPermission;

use App\Http\Controllers\Controller;
use App\Models\MaRoute;
use Illuminate\Http\Request;

class ManagerRouteController extends Controller
{
    public function index()
    {

        return response()->json(
            MaRoute::select('id', 'name')->get()
        );
        // $routes = MaRoute::pluck('name');

        // return response()->json([
        //     'status' => 'success',
        //     'data' => $routes
        // ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:ma_routes,name',
        ]);

        $route = MaRoute::create([
            'name' => strtolower(trim($request->name))
        ]);

        return response()->json([
            'message' => 'Route créée avec succès!',
            'data' => $route
        ], 201);
    }

    public function destroy($id)
    {
        $route = MaRoute::findOrFail($id);
        $route->delete();

        return response()->json(['message' => 'Route supprimée avec succès!'], 200);
    }
}