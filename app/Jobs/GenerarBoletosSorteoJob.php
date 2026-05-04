<?php

namespace App\Jobs;

use App\Models\Punto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use ZipArchive;

class GenerarBoletosSorteoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;
    public int $tries   = 2;

    public function __construct(
        public readonly string $zipFilename
    ) {}

    public function handle(): void
    {
        Storage::disk('public')->makeDirectory('sorteo');

        $zipPath = storage_path('app/public/sorteo/' . $this->zipFilename);

        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException("No se pudo crear ZIP: {$zipPath}");
        }

        // Cargar cliente Y boleta para tener el código único BOL-2026-XXXXX
        // Solo clientes pendientes o activos (excluye rechazados)
        $puntos = Punto::with(['cliente', 'boleta'])
            ->whereHas('cliente', fn($q) => $q->whereIn('estado', ['pendiente', 'activo']))
            ->orderByDesc('puntos')
            ->get();

        if ($puntos->isEmpty()) {
            $zip->close();
            return;
        }

        $pdf = Pdf::loadView('reportes.boletos', ['puntos' => $puntos])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => true,
                'defaultFont'          => 'DejaVu Sans',
                'dpi'                  => 150,
            ]);

        $filename = 'boletos_sorteo_' . now()->format('Ymd_His') . '.pdf';
        $zip->addFromString($filename, $pdf->output());
        $zip->close();
    }
}
