<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClienteWebController extends Controller{
    public function index(): Response{
        Gate::authorize('viewAny', Cliente::class);
        return Inertia::render('clientes/indexclientes');
    }
    public function show(string $id): Response{
        $cliente = Cliente::findOrFail($id);
        Gate::authorize('view', $cliente);

        $verificationUrl = null;

        if (! $cliente->email_verified_at && $cliente->email_verification_token) {
            $clienteCampania = $cliente->clienteCampanias()
                ->with('campania')
                ->latest()
                ->first();

            $campania = $clienteCampania?->campania;

            if ($campania && $campania->url) {
                // Detecta si el path de la campaña es para veterinarios o clientes
                $esVeterinario = str_contains($campania->url, 'veterinarios');

                $baseUrl = $esVeterinario
                    ? config('app.frontend_url_veterinarios')
                    : config('app.frontend_url_cliente');

                // El path guardado en BD, sin dominio (ej: "promo-chayanne/veterinarios")
                $path = ltrim($campania->url, '/');

                $verificationUrl = rtrim($baseUrl, '/')
                    . '/' . $path
                    . '/email/verify/'
                    . $cliente->email_verification_token;
            }
        }

        return Inertia::render('clientes/detallecliente', [
            'clienteId'       => $cliente->id,
            'verificationUrl' => $verificationUrl,
        ]);
    }
}
