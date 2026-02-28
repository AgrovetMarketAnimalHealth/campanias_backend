<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RolesWebController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('roles/indexroles');
    }
}