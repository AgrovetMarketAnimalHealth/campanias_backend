<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Boleta;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BoletaWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Boleta::class);
        return Inertia::render('boletas/indexboletas');
    }
}