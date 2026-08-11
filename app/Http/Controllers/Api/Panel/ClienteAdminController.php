<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cliente\StoreClienteRequest;
use App\Http\Requests\Admin\Cliente\UpdateClienteRequest;
use App\Http\Resources\Boleta\BoletaResource;
use App\Http\Resources\Boleta\BoletaResourceC;
use App\Http\Resources\Cliente\ClienteResource;
use App\Jobs\EnviarEmailBoleta;
use App\Jobs\EnviarEmailRegistro;
use App\Models\Boleta;
use App\Models\Campania;
use App\Models\Cliente;
use App\Models\ClienteCampania;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ClienteAdminController extends Controller{
    public function index(Request $request): AnonymousResourceCollection{
        Gate::authorize('viewAny', Cliente::class);
        $campaniaIds = array_filter((array) $request->campania_id);

        $clientes = Cliente::query()
            ->withCount([
                'boletas as boletas_aceptadas' => fn($q) => $q->where('estado', 'aceptada')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
                'boletas as boletas_pendientes' => fn($q) => $q->where('estado', 'pendiente')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
                'boletas as boletas_rechazadas' => fn($q) => $q->where('estado', 'rechazada')
                    ->when($campaniaIds, fn($q2) => $q2->whereIn('compania_id', $campaniaIds)),
            ])
            ->withSum([
                'puntos as total_puntos' => fn($q) => $q->when(
                    $campaniaIds,
                    fn($q2) => $q2->whereIn('campania_id', $campaniaIds)
                ),
            ], 'puntos')
            ->when($campaniaIds, fn($q) =>
                $q->whereHas('clienteCampanias', fn($q2) =>
                    $q2->whereIn('campania_id', $campaniaIds)
                )
            )
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
    public function register(StoreClienteRequest $request){
        $campania = Campania::where('id', $request->campania_id)
            ->where('activa', true)
            ->first();
        if (!$campania) {
            return response()->json([
                'success' => false,
                'message' => 'La campaña no existe o no está activa.',
            ], 404);
        }
        DB::beginTransaction();
        try {
            $cliente = Cliente::create([
                'campania_id'       => $campania->id,
                'tipo_persona'      => $request->tipo_persona,
                'nombre'            => $request->nombre,
                'apellidos'         => $request->apellidos,
                'dni'               => $request->dni,
                'ruc'               => $request->ruc,
                'departamento'      => $request->departamento,
                'email'             => $request->email,
                'telefono'          => $request->telefono,
                'acepta_politicas'  => true,
                'acepta_terminos'   => true,
                'estado'            => 'activo',
                'tipo_registro'     => $campania->tipo_registro,
            ]);
            $clienteCampania = ClienteCampania::create([
                'cliente_id'  => $cliente->id,
                'campania_id' => $campania->id,
            ]);
            $boleta = null;
            if ($request->hasFile('archivo_comprobante')) {
                $archivo = $request->file('archivo_comprobante');
                $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
                $ruta = $archivo->storeAs(
                    "clientes/{$cliente->id}/comprobantes",
                    $nombreArchivo,
                    'public'
                );
                $boleta = Boleta::create([
                    'cliente_id'  => $cliente->id,
                    'compania_id' => $campania->id,
                    'archivo'     => $ruta,
                    'estado'      => 'pendiente',
                    'created_by'  => $cliente->id,
                ]);
            }
            DB::commit();
            EnviarEmailRegistro::dispatch(
                $cliente,
                $campania
            )->onQueue('emails');
            if ($boleta) {
                EnviarEmailBoleta::dispatch(
                    $cliente,
                    $boleta,
                    $campania
                )->onQueue('emails');
            }
            return response()->json([
                'success' => true,
                'message' => $boleta
                    ? 'Registro exitoso. El comprobante fue recibido y está en revisión.'
                    : 'Registro exitoso.',
                'data' => [
                    'cliente' => $cliente,
                    'boleta' => $boleta
                        ? new BoletaResource($boleta)
                        : null,
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
