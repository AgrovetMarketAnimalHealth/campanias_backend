<?php

namespace App\Http\Controllers\Api\Panel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Punto\ClientePuntoResource;
use App\Jobs\GenerarBoletosSorteoJob;
use App\Models\Boleta;
use App\Models\Campania;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ClientePuntoController extends Controller
{
    public function index(Request $request){
        $request->validate([
            'campania_id' => ['nullable', 'uuid', Rule::exists('campanias', 'id')],
        ]);

        $perPage = min((int) $request->input('per_page', 50), 200);
        $puntos = Boleta::with('cliente')
            ->join('clientes', 'boletas.cliente_id', '=', 'clientes.id')
            ->where('clientes.estado', 'activo')
            ->where('boletas.estado', 'aceptada')
            ->when($request->filled('campania_id'), fn($query) =>
                $query->where('boletas.compania_id', $request->campania_id)
            )
            ->selectRaw('boletas.cliente_id, SUM(boletas.puntos_otorgados) as puntos, clientes.ganador')
            ->groupBy('boletas.cliente_id', 'clientes.ganador')
            ->orderByDesc('clientes.ganador')
            ->orderByDesc('puntos')
            ->paginate($perPage);
        return ClientePuntoResource::collection($puntos);
    }

    public function exportarBoletos(Request $request)
    {
        $request->validate([
            'campania_id' => ['required', 'uuid', Rule::exists('campanias', 'id')],
        ]);

        abort_unless(
            Campania::whereKey($request->campania_id)->where('activa', true)->exists(),
            403,
            'Solo se pueden generar boletos para campañas activas.'
        );

        $filename = 'sorteo_boletos_' . $request->campania_id . '_' . now()->format('Ymd_His') . '.zip';
        GenerarBoletosSorteoJob::dispatch($filename, $request->campania_id);

        return response()->json([
            'ok'       => true,
            'message'  => 'Generando boletos en segundo plano...',
            'filename' => $filename,
            'url'      => url("/promo-concierto/backoffice/punto/descargar/{$filename}"),
        ], 202);
    }

    public function estadoBoletos(string $filename)
    {
        $this->autorizarDescargaCampania($filename);
        $path = "sorteo/{$filename}";

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['listo' => false], 200);
        }

        return response()->json([
            'listo' => true,
            'url'   => url("/promo-concierto/backoffice/punto/descargar/{$filename}"),
            'size'  => Storage::disk('public')->size($path),
        ]);
    }

    public function descargarBoletos(string $filename)
    {
        $this->autorizarDescargaCampania($filename);
        $path = "sorteo/{$filename}";

        abort_unless(
            Storage::disk('public')->exists($path),
            404,
            'El archivo aún no está disponible.'
        );

        return Storage::disk('public')->download($path, $filename);
    }

    private function autorizarDescargaCampania(string $filename): void
    {
        preg_match('/^sorteo_boletos_([0-9a-f-]{36})_\d{8}_\d{6}\.zip$/i', $filename, $matches);

        abort_unless(
            isset($matches[1]) && Campania::whereKey($matches[1])->where('activa', true)->exists(),
            403,
            'Solo se pueden descargar boletos de campañas activas.'
        );
    }
}
