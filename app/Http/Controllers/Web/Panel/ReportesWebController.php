<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Boleta;
use App\Models\Campania;
use App\Models\Cliente;
use App\Models\Punto;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportesWebController extends Controller{
    public function index(): Response{
        Gate::authorize('viewAny', Cliente::class);

        $campanias = Campania::query()
            ->orderByDesc('activa')
            ->orderByDesc('created_at')
            ->get(['id', 'nombre', 'activa']);
        $campaniaId = $campanias->firstWhere('activa', true)?->id;
        $clientes = Cliente::query()->when($campaniaId, fn($query) =>
            $query->whereHas('clienteCampanias', fn($campaignQuery) =>
                $campaignQuery->where('campania_id', $campaniaId)
            )
        )->where('estado', '!=', 'test');

        return Inertia::render('reportes/clientes/indexclientes', [
            'metricas' => [
                'total_inscritos' => (clone $clientes)->count(),
                'inscritos_hoy'   => (clone $clientes)->whereDate('created_at', today())->count(),
                'activos'         => (clone $clientes)->where('estado', 'activo')->count(),
                'pendientes'      => (clone $clientes)->where('estado', 'pendiente')->count(),
                'rechazados'      => (clone $clientes)->where('estado', 'rechazado')->count(),
                'test'            => 0,
            ],
            'campanias' => $campanias,
            'campania_id' => $campaniaId,
        ]);
    }
    public function indexboletas(): Response{
        Gate::authorize('viewAny', Boleta::class);

        $campanias = Campania::query()
            ->orderByDesc('activa')
            ->orderByDesc('created_at')
            ->get(['id', 'nombre', 'activa']);
        $campaniaId = $campanias->firstWhere('activa', true)?->id;
        $boletas = Boleta::query()->when($campaniaId, fn($query) =>
            $query->where('compania_id', $campaniaId)
        );

        return Inertia::render('reportes/boletas/indexboletas', [
            'metricas' => [
                'total_boletas'  => (clone $boletas)->count(),
                'boletas_hoy'    => (clone $boletas)->whereDate('created_at', today())->count(),
                'boletas_mes'    => (clone $boletas)->whereMonth('created_at', now()->month)
                                        ->whereYear('created_at', now()->year)->count(),
                'pendientes'     => (clone $boletas)->where('estado', 'pendiente')->count(),
                'aceptadas'      => (clone $boletas)->where('estado', 'aceptada')->count(),
                'rechazadas'     => (clone $boletas)->where('estado', 'rechazada')->count(),
            ],
            'campanias' => $campanias,
            'compania_id' => $campaniaId,
        ]);
    }
    public function indexpuntos(): Response{
        Gate::authorize('viewAny', Punto::class);
        return Inertia::render('reportes/puntos/indexpuntos', [
            'campanias' => Campania::query()
                ->orderByDesc('activa')
                ->orderByDesc('created_at')
                ->get(['id', 'nombre', 'activa']),
        ]);
    }
    public function indexpuntosDetalle(Campania $campania): Response{
        Gate::authorize('viewAny', Punto::class);

        return Inertia::render('reportes/puntos/detallepuntos', [
            'campania' => $campania->only(['id', 'nombre', 'activa']),
        ]);
    }
}
