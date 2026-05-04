<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Punto\ClientePuntoResource;
use App\Jobs\GenerarBoletosSorteoJob;
use App\Models\Boleta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClientePuntoController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 50), 200);

        $puntos = Boleta::with('cliente')
            ->whereHas('cliente', fn($q) => $q->whereIn('estado', ['pendiente', 'activo']))
            ->where('estado', 'aceptada')                   // solo boletas aceptadas dan puntos
            ->selectRaw('cliente_id, SUM(puntos_otorgados) as puntos')
            ->groupBy('cliente_id')
            ->orderByDesc('puntos')
            ->paginate($perPage);

        return ClientePuntoResource::collection($puntos);
    }

    public function exportarBoletos()
    {
        $filename = 'sorteo_boletos_' . now()->format('Ymd_His') . '.zip';
        GenerarBoletosSorteoJob::dispatch($filename);

        return response()->json([
            'ok'       => true,
            'message'  => 'Generando boletos en segundo plano...',
            'filename' => $filename,
            'url'      => Storage::disk('public')->url("sorteo/{$filename}"),
        ], 202);
    }

    public function estadoBoletos(string $filename)
    {
        $path = "sorteo/{$filename}";

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['listo' => false], 200);
        }

        return response()->json([
            'listo' => true,
            'url'   => Storage::disk('public')->url($path),
            'size'  => Storage::disk('public')->size($path),
        ]);
    }

    public function descargarBoletos(string $filename)
    {
        $path = "sorteo/{$filename}";

        abort_unless(
            Storage::disk('public')->exists($path),
            404,
            'El archivo aún no está disponible.'
        );

        return Storage::disk('public')->download($path, $filename);
    }
}
