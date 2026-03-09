<?php
namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Support\Facades\Gate;
use App\Models\Punto;
use Inertia\Inertia;
use Inertia\Response;

class ReportesWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Cliente::class);
        return Inertia::render('reportes/clientes/indexclientes');
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
