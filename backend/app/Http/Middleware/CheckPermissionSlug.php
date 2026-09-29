<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermissionSlug
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $requiredSlug  (e.g. '/role', '/publications')
     */
    public function handle(Request $request, Closure $next, string $requiredSlug): Response
    {
        /** @var \App\Models\UserManager $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $roleName = strtolower($user->role ? $user->role->name : '');
        if (in_array($roleName, ['admin', 'super admin', 'super-admin'])) {
            return $next($request);
        }

        $allowedSlugs = $user->role 
            ? $user->role->permissions->pluck('slug')->filter()->toArray() 
            : [];

        $requiredSlug = '/' . ltrim($requiredSlug, '/');

        if (!in_array($requiredSlug, $allowedSlugs)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Accès non autorisé à cette ressource.'
            ], 403);
        }

        return $next($request);
    }
}