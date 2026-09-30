<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $userRole = $user->role?->nom_role;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
            ], 403);
        }

        return $next($request);
    }
}
