<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cliente\UpdateClienteRequest;
use App\Http\Resources\Boleta\BoletaResourceC;
use App\Http\Resources\Cliente\ClienteResource;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ClienteAdminController extends Controller{
    public function index(Request $request): AnonymousResourceCollection{
        Gate::authorize('viewAny', Cliente::class);
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
    public function boletas(Request $request, Cliente $cliente){
        Gate::authorize('view', $cliente);
        $boletas = $cliente->boletas()
            ->when($request->estado, fn($q, $estado) => $q->where('estado', $estado))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);
        return BoletaResourceC::collection($boletas);
    }
    public function update(UpdateClienteRequest $request, Cliente $cliente): ClienteResource{
        Gate::authorize('update', $cliente);
        $data = $request->validated();
        if (isset($data['email']) && $data['email'] !== $cliente->email) {
            $data['email_verified_at'] = null;
        }
        $cliente->update($data);
        return new ClienteResource($cliente);
    }
    public function show(Cliente $cliente): ClienteResource{
        Gate::authorize('view', $cliente);
        return new ClienteResource($cliente);
    }
}
