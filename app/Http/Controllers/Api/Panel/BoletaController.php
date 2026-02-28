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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Pipeline;

class BoletaController extends Controller
{
    public function __construct(
        private readonly BoletaService $boletaService
    ) {}

    public function index(Request $request)
    {
        $perPage    = $request->input('per_page', 15);
        $search     = $request->input('search', '');
        $estado     = $request->input('estado', 'pendiente');
        $fechaDesde = $request->input('fecha_desde');
        $fechaHasta = $request->input('fecha_hasta');

        $query = Pipeline::send(Boleta::query())
            ->through([
                new SearchBoletaFilter($search),
                new EstadoBoletaFilter($estado),
                new RangoFechaBoletaFilter($fechaDesde, $fechaHasta),
            ])
            ->thenReturn()
            ->with('cliente')
            ->latest('created_at');

        return BoletaResourceBackend::collection($query->paginate($perPage));
    }

    public function show(Boleta $boleta)
    {
        return new BoletaResourceBackend($boleta);
    }

    public function update(UpdateBoletaRequest $request, Boleta $boleta)
    {
        if ($request->estado === 'aceptada') {
            $this->boletaService->aceptar(
                boleta:       $boleta,
                puntos:       $request->puntos,
                monto:        $request->monto,
                numeroBoleta: $request->numero_boleta,
                observacion:  $request->observacion,
            );
        }

        if ($request->estado === 'rechazada') {
            $this->boletaService->rechazar(
                boleta:       $boleta,
                observacion:  $request->observacion,
                monto:        $request->monto,
                numeroBoleta: $request->numero_boleta,
            );
        }

        return new BoletaResourceBackend($boleta->fresh());
    }
}