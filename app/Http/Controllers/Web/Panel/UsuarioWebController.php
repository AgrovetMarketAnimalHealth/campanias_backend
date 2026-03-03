<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);
        return Inertia::render('usuarios/indexusuarios');
    }
}