<?php
namespace App\Http\Controllers\Api\Panel;

use App\Filters\Boleta\EstadoBoletaFilter;
use App\Filters\Boleta\RangoFechaBoletaFilter;
use App\Filters\Boleta\SearchBoletaFilter;
use App\Http\Controllers\Controller;
use App\Http\Resources\Boleta\BoletaResourceBackend;
use App\Models\Boleta;
use App\Services\BoletaService;
use App\Http\Requests\Admin\Boleta\UpdateBoletaRequest;
use App\Http\Resources\Boleta\BoletaResource;
use App\Jobs\EnviarEmailBoleta;
use App\Models\Cliente;
use App\Models\ClienteCampania;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class BoletaController extends Controller
{
    public function __construct(
        private readonly BoletaService $boletaService
    ) {}
    public function index(Request $request){
        Gate::authorize('viewAny', Boleta::class);
        $perPage    = $request->input('per_page', 15);
        $search     = $request->input('search');
        $estado     = $request->input('estado');
        $fechaDesde = $request->input('fecha_desde');
        $fechaHasta = $request->input('fecha_hasta');
        $campaniaId = $request->input('campania_id', 'todos');
        $query = Pipeline::send(Boleta::query())
                    ->through([
                        new SearchBoletaFilter($search),
                        new EstadoBoletaFilter($estado),
                        new RangoFechaBoletaFilter($fechaDesde, $fechaHasta),
                    ])
                    ->thenReturn()
                    ->when($campaniaId === null, function ($q) {
                        $q->whereNull('compania_id');
                    })
                    ->when($campaniaId !== null && $campaniaId !== 'todos', function ($q) use ($campaniaId) {
                        $q->where('compania_id', $campaniaId);
                    })
                    ->with('cliente')
                    ->latest('created_at');
        return BoletaResourceBackend::collection($query->paginate($perPage));
    }
    public function show(Boleta $boleta)
    {
        Gate::authorize('view', $boleta);
        return new BoletaResourceBackend($boleta);
    }

    public function update(UpdateBoletaRequest $request, Boleta $boleta)
    {
        Gate::authorize('update', $boleta);

        if ($request->estado === 'aceptada') {
            $this->boletaService->aceptar(
                boleta:         $boleta,
                puntos:         $request->puntos,
                monto:          $request->monto,
                numeroBoleta:   $request->numero_boleta,
                rucVeterinaria: $request->ruc_veterinaria,
                observacion:    $request->observacion,
            );
        }

        if ($request->estado === 'rechazada') {
            $this->boletaService->rechazar(
                boleta:         $boleta,
                observacion:    $request->observacion,
                monto:          $request->monto,
                numeroBoleta:   $request->numero_boleta,
                rucVeterinaria: $request->ruc_veterinaria,
            );
        }

        return new BoletaResourceBackend($boleta->fresh());
    }
    public function store(Request $request){
        $request->validate([
            'cliente_id' => ['required', 'uuid', 'exists:clientes,id'],
            'archivo'    => ['required', 'file', 'mimes:jpg,jpeg,png,pdf'],
        ]);
        $cliente = Cliente::find($request->cliente_id);
        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'El cliente no existe.',
            ], 404);
        }
        $clienteCampania = ClienteCampania::where('cliente_id', $cliente->id)
            ->whereHas('campania', function ($q) {
                $q->where('activa', true);
            })
            ->latest()
            ->first();
        if (!$clienteCampania) {
            return response()->json([
                'success' => false,
                'message' => 'El cliente no tiene una campaña activa.',
            ], 404);
        }
        $campania = $clienteCampania->campania;
        $archivo = $request->file('archivo');
        $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
        $ruta = $archivo->storeAs(
            "clientes/{$cliente->id}/comprobantes",
            $nombreArchivo,
            'public'
        );
        $boleta = Boleta::create([
            'cliente_id'  => $cliente->id,
            'campania_id' => $campania->id,
            'archivo'     => $ruta,
            'estado'      => 'pendiente',
            'created_by'  => $cliente->id,
        ]);
        EnviarEmailBoleta::dispatch(
            $cliente,
            $boleta,
            $campania
        )->onQueue('emails');
        return response()->json([
            'success' => true,
            'message' => 'Comprobante subido correctamente. Será revisado pronto.',
            'data'    => new BoletaResource($boleta),
        ], 201);
    }
}