<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class DeviceTrustService
{
    public function guardarDispositivo(Request $request, string $clienteId): void
    {
        $geo = $this->getGeoIp($request->ip());

        DB::table('personal_access_tokens')
            ->where('tokenable_id', $clienteId)
            ->where('tokenable_type', 'App\\Models\\Cliente')
            ->latest('created_at')
            ->limit(1)
            ->update([
                'ip'             => $request->ip(),
                'user_agent'     => substr($request->userAgent() ?? '', 0, 255),
                'pais'           => $geo['country'] ?? null,
                'ciudad'         => $geo['city'] ?? null,
                'last_active_at' => now(),
            ]);
    }

    public function esSospechoso(Request $request, string $clienteId): array
    {
        $token = DB::table('personal_access_tokens')
            ->where('tokenable_id', $clienteId)
            ->where('tokenable_type', 'App\\Models\\Cliente')
            ->latest('last_active_at')
            ->first();

        if (!$token || !$token->pais) {
            return ['sospechoso' => false];
        }

        $geoActual  = $this->getGeoIp($request->ip());
        $paisActual = $geoActual['country'] ?? null;

        // Cambió el país
        if ($paisActual && $token->pais !== $paisActual) {
            return [
                'sospechoso' => true,
                'motivo'     => "Acceso desde un país diferente ({$paisActual}) al registrado ({$token->pais})",
            ];
        }

        // Inactivo más de 60 días
        if ($token->last_active_at) {
            $dias = Carbon::parse($token->last_active_at)->diffInDays(now());
            if ($dias > 60) {
                return [
                    'sospechoso' => true,
                    'motivo'     => "Sin actividad por {$dias} días",
                ];
            }
        }

        return ['sospechoso' => false];
    }

    public function renovarActividad(int $tokenId): void
    {
        DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->update(['last_active_at' => now()]);
    }

    private function getGeoIp(string $ip): array
    {
        if (in_array($ip, ['127.0.0.1', '::1'])) {
            return ['country' => 'LOCAL', 'city' => 'LOCAL'];
        }

        try {
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=country,city,status");
            if ($response->ok() && $response->json('status') === 'success') {
                return $response->json();
            }
        } catch (\Throwable) {}

        return [];
    }
}