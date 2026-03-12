<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Boleta;
use App\Models\Cliente;
use App\Models\Punto;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportesWebController extends Controller{
    public function index(): Response{
        Gate::authorize('viewAny', Cliente::class);
        return Inertia::render('reportes/clientes/indexclientes', [
            'metricas' => [
                'total_inscritos' => Cliente::count(),
                'inscritos_hoy'   => Cliente::whereDate('created_at', today())->count(),
                'activos'         => Cliente::where('estado', 'activo')->count(),
                'pendientes'      => Cliente::where('estado', 'pendiente')->count(),
                'rechazados'      => Cliente::where('estado', 'rechazado')->count(),
            ],
        ]);
    }
    public function indexboletas(): Response{
        Gate::authorize('viewAny', Boleta::class);
        return Inertia::render('reportes/boletas/indexboletas', [
            'metricas' => [
                'total_boletas'  => Boleta::count(),
                'boletas_hoy'    => Boleta::whereDate('created_at', today())->count(),
                'boletas_mes'    => Boleta::whereMonth('created_at', now()->month)
                                        ->whereYear('created_at', now()->year)->count(),
                'pendientes'     => Boleta::where('estado', 'pendiente')->count(),
                'aceptadas'      => Boleta::where('estado', 'aceptada')->count(),
                'rechazadas'     => Boleta::where('estado', 'rechazada')->count(),
            ],
        ]);
    }
    public function indexpuntos(): Response{
        Gate::authorize('viewAny', Punto::class);
        return Inertia::render('reportes/puntos/indexpuntos');
    }
}
