<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Boleta\BoletaResourceC;
use App\Http\Resources\Cliente\ClienteResource;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClienteAdminController extends Controller
{
    /**
     * GET /cliente
     * Lista paginada de clientes con resumen de boletas.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $clientes = Cliente::query()
            ->withCount([
                'boletas as boletas_aceptadas'  => fn($q) => $q->where('estado', 'aceptada'),
                'boletas as boletas_pendientes' => fn($q) => $q->where('estado', 'pendiente'),
                'boletas as boletas_rechazadas' => fn($q) => $q->where('estado', 'rechazada'),
            ])
            ->when($request->search, fn($q, $search) =>
                $q->where(fn($q) =>
                    $q->where('nombre',    'like', "%$search%")
                      ->orWhere('apellidos', 'like', "%$search%")
                      ->orWhere('dni',       'like', "%$search%")
                      ->orWhere('email',     'like', "%$search%")
                )
            )
            ->when($request->tipo_persona, fn($q, $tipo)   => $q->where('tipo_persona', $tipo))
            ->when($request->departamento, fn($q, $dep)    => $q->where('departamento', $dep))
            ->when($request->estado,       fn($q, $estado) => $q->where('estado', $estado))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return ClienteResource::collection($clientes);
    }

    /**
     * GET /cliente/{id}/boletas
     * Boletas que pertenecen únicamente a ese cliente.
     */
    public function boletas(Request $request, string $id): AnonymousResourceCollection
    {
        $cliente = Cliente::findOrFail($id);

        $boletas = $cliente->boletas()
            ->when($request->estado, fn($q, $estado) => $q->where('estado', $estado))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return BoletaResourceC::collection($boletas);
    }
}