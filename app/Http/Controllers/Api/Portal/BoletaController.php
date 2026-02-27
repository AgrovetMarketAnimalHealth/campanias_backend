<?php
namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Boleta\BoletaResource;
use App\Jobs\EnviarEmailBoleta;
use App\Models\Boleta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

class BoletaController extends Controller{
    public function resumen(Request $request): JsonResponse{
        $cliente = Auth::guard('sanctum')->user();

        $totalPuntos    = Boleta::where('cliente_id', $cliente->id)->aceptada()->sum('puntos_otorgados');
        $totalAceptadas = Boleta::where('cliente_id', $cliente->id)->aceptada()->count();
        $totalPendiente = Boleta::where('cliente_id', $cliente->id)->pendiente()->count();
        $totalRechazada = Boleta::where('cliente_id', $cliente->id)->rechazada()->count();
        $totalBoletas   = $totalAceptadas + $totalPendiente + $totalRechazada;

        $porcentajeAceptadas = $totalBoletas > 0 ? round(($totalAceptadas / $totalBoletas) * 100, 2) : 0;
        $porcentajePendiente = $totalBoletas > 0 ? round(($totalPendiente / $totalBoletas) * 100, 2) : 0;
        $porcentajeRechazada = $totalBoletas > 0 ? round(($totalRechazada / $totalBoletas) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'puntos_acumulados'   => (float) $totalPuntos,
                'total_boletas'       => $totalBoletas,
                'aceptadas'           => [
                    'cantidad'    => $totalAceptadas,
                    'porcentaje'  => $porcentajeAceptadas,
                ],
                'pendientes'          => [
                    'cantidad'    => $totalPendiente,
                    'porcentaje'  => $porcentajePendiente,
                ],
                'rechazadas'          => [
                    'cantidad'    => $totalRechazada,
                    'porcentaje'  => $porcentajeRechazada,
                ],
            ],
        ]);
    }

    public function index(Request $request){
        $cliente = Auth::guard('sanctum')->user();
        $boletas = Boleta::where('cliente_id', $cliente->id)
            ->when($request->estado, function ($query, $estado) {
                $query->where('estado', $estado);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return BoletaResource::collection($boletas);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf'],
        ]);

        $cliente = Auth::guard('sanctum')->user();

        $directorio = public_path("clientes/{$cliente->id}/comprobantes");
        if (!is_dir($directorio)) {
            mkdir($directorio, 0775, true);
        }

        $archivo       = $request->file('archivo');
        $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
        $archivo->move($directorio, $nombreArchivo);
        $ruta = "clientes/{$cliente->id}/comprobantes/{$nombreArchivo}";

        $boleta = Boleta::create([
            'cliente_id' => $cliente->id,
            'archivo'    => $ruta,
            'estado'     => 'pendiente',
            'created_by' => $cliente->id,
        ]);

        EnviarEmailBoleta::dispatch($cliente, $boleta)->onQueue('emails');

        return response()->json([
            'success' => true,
            'message' => 'Comprobante subido correctamente. Será revisado pronto.',
            'data'    => new BoletaResource($boleta),
        ], 201);
    }
    public function show(Boleta $boleta){
        $cliente = Auth::guard('sanctum')->user();

        if ($boleta->cliente_id !== $cliente->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver esta boleta.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new BoletaResource($boleta),
        ]);
    }
}