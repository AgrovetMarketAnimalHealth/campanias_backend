<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RolesWebController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);
        return Inertia::render('roles/indexroles');
    }
}