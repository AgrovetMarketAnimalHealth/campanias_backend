<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Gate;
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