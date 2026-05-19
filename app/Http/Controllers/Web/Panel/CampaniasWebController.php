<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Campania;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CampaniasWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Campania::class);
        return Inertia::render('campanias/indexcampanias');
    }
}