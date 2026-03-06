<?php
// app/Http/Middleware/DetectarSesionSospechosa.php

namespace App\Http\Middleware;

use App\Jobs\EnviarEmailSesionSospechosa;
use App\Services\DeviceTrustService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DetectarSesionSospechosa
{
    public function __construct(private DeviceTrustService $trust) {}

    public function handle(Request $request, Closure $next): Response
    {
        $cliente = Auth::guard('sanctum')->user();

        if (!$cliente) {
            return $next($request);
        }

        $resultado = $this->trust->esSospechoso($request, $cliente->id);

        if ($resultado['sospechoso']) {
            $cliente->tokens()->delete();

            EnviarEmailSesionSospechosa::dispatch($cliente, [
                'ip'         => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? 'Desconocido', 0, 255),
                'fecha'      => now()->format('d/m/Y H:i'),
                'motivo'     => $resultado['motivo'],
            ])->onQueue('emails');

            return response()->json([
                'success' => false,
                'accion'  => 'sesion_cerrada',
                'message' => 'Detectamos actividad inusual. Tu sesión fue cerrada por seguridad. Revisa tu correo.',
            ], 401);
        }

        // Todo normal → renovar actividad
        $this->trust->renovarActividad($cliente->currentAccessToken()->id);

        return $next($request);
    }
}