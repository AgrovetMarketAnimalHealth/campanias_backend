<?php
namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Support\Facades\Gate;
use App\Models\Punto;
use Inertia\Inertia;
use Inertia\Response;

class ReportesWebController extends Controller{
    public function index(): Response{
        Gate::authorize('viewAny', Cliente::class);
        $metricas = [
            'total_inscritos' => Cliente::count(),
            'inscritos_hoy' => Cliente::whereDate('created_at', today())->count(),
            'inscritos_mes' => Cliente::whereMonth('created_at', now()->month)
                                    ->whereYear('created_at', now()->year)->count(),
            'activos' => Cliente::where('estado', 'activo')->count(),
            'pendientes' => Cliente::where('estado', 'pendiente')->count(),
            'rechazados' => Cliente::where('estado', 'rechazado')->count(),
        ];
        return Inertia::render('reportes/clientes/indexclientes', [
            'metricas' => $metricas
        ]);
    }
    
    public function indextop(): Response
    {
        Gate::authorize('viewAny', Cliente::class);
        return Inertia::render('reportes/top/indextop');
    }
    public function indexpuntos(): Response
    {
        Gate::authorize('viewAny', Punto::class);
        return Inertia::render('reportes/puntos/indexpuntos');
    }
}
