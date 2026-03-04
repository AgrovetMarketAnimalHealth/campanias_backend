<?php
namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use App\Models\Notificacion;
use Inertia\Inertia;
use Inertia\Response;

class NotificacionWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Notificacion::class);
        return Inertia::render('notificaciones/indexnotificaciones');
    }
}
