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

class GenerarBoletosSorteoJob implements ShouldQueue{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $timeout = 600;
    public int $tries   = 2;
    public function __construct(
        public readonly string $zipFilename
    ) {}
    public function handle(): void{
        Storage::disk('public')->makeDirectory('sorteo');
        $zipPath = storage_path('app/public/sorteo/' . $this->zipFilename);
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException("No se pudo crear ZIP: {$zipPath}");
        }
        Punto::with('cliente')
            ->orderByDesc('puntos')
            ->chunk(50, function ($puntos) use ($zip) {
                foreach ($puntos as $punto) {
                    $cantidad = (int) $punto->puntos;
                    if ($cantidad <= 0) {
                        continue;
                    }
                    $cliente = $punto->cliente;
                    $tipo    = $cliente->tipo ?? 'natural';
                    $nombre  = $tipo === 'juridica'
                        ? ($cliente->razon_social ?? $cliente->nombre ?? 'juridica')
                        : trim(($cliente->nombre ?? '') . '_' . ($cliente->apellido ?? ''));
                    $slug     = str($nombre)->slug('_')->limit(40);
                    $filename = "boletos_{$slug}_{$cantidad}boletos.pdf";
                    $pdf = Pdf::loadView('reportes.boletos', [
                        'puntos' => collect([$punto]),
                    ])
                    ->setPaper('a4', 'portrait')
                    ->setOptions([
                        'isHtml5ParserEnabled' => true,
                        'isRemoteEnabled'      => true,
                        'defaultFont'          => 'DejaVu Sans',
                        'dpi'                  => 150,
                    ]);
                    $zip->addFromString($filename, $pdf->output());
                }
            });
        $zip->close();
    }
}
