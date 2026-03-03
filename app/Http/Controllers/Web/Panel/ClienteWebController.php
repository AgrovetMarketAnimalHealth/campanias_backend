<?php

namespace App\Http\Controllers\Web\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClienteWebController extends Controller{
    public function index(): Response{
        Gate::authorize('viewAny', Cliente::class);
        return Inertia::render('clientes/indexclientes');
    }
    public function show(string $id): Response{
        $cliente = Cliente::findOrFail($id);
        Gate::authorize('view', $cliente);
        return Inertia::render('clientes/detallecliente', [
            'clienteId' => $cliente->id,
        ]);
    }
}
