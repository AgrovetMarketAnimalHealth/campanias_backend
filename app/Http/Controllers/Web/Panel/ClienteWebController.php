<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ClienteWebController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('clientes/indexclientes');
    }

    public function show(string $id): Response
    {
        return Inertia::render('clientes/detallecliente', [
            'clienteId' => $id,
        ]);
    }
}