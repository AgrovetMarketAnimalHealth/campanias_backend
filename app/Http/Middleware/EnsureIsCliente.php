<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureIsCliente
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user || !$user instanceof \App\Models\Cliente) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso no autorizado.',
            ], 403);
        }

        return $next($request);
    }
}
