<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClienteEmailVerificado
{
    public function handle(Request $request, Closure $next)
    {
        $cliente = Auth::guard('cliente')->user();

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado.',
                'code'    => 'UNAUTHENTICATED'
            ], 401);
        }

        if (!$cliente->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Debes verificar tu correo antes de continuar.',
                'code'    => 'EMAIL_NOT_VERIFIED',
                'data'    => ['id' => $cliente->id]
            ], 403);
        }

        return $next($request);
    }
}
