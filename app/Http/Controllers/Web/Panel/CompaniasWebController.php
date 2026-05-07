<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Campanias;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CompaniasWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Campanias::class);
        return Inertia::render('companias/indexcompanias');
    }
}