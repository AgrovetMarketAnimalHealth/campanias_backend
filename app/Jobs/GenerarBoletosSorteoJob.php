<?php

namespace App\Jobs;

use App\Models\Punto;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class GenerarBoletosSorteoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const POINTS_PER_QUERY = 250;

    private const TICKETS_PER_PDF = 500;

    public int $timeout = 0;

    public int $tries = 2;

    public function __construct(
        public readonly string $zipFilename,
        public readonly string $campaniaId
    ) {}

    public function handle(): void
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory('sorteo');

        if (basename($this->zipFilename) !== $this->zipFilename) {
            throw new \InvalidArgumentException('El nombre del ZIP no es válido.');
        }

        $zipPath = $disk->path('sorteo/'.$this->zipFilename);

        $temporaryZipPath = $zipPath.'.'.\Illuminate\Support\Str::uuid().'.tmp';
        $zip = new ZipArchive;
        $zipIsOpen = false;

        try {
            $result = $zip->open($temporaryZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            if ($result !== true) {
                throw new \RuntimeException("No se pudo crear el ZIP temporal (código {$result}).");
            }

            $zipIsOpen = true;

            $lastPoints = null;
            $lastId = null;
            $tickets = [];
            $pdfNumber = 0;

            do {
                $query = Punto::with(['cliente', 'boleta'])
                    ->where('campania_id', $this->campaniaId)
                    ->whereHas('cliente', function ($q) {
                        $q->where('estado', 'activo')
                            ->where('ganador', false);
                    });

                if ($lastId !== null) {
                    $query->where(function ($q) use ($lastPoints, $lastId) {
                        $q->where('puntos', '<', $lastPoints)
                            ->orWhere(function ($q) use ($lastPoints, $lastId) {
                                $q->where('puntos', $lastPoints)
                                    ->where('id', '<', $lastId);
                            });
                    });
                }

                $puntos = $query
                    ->orderByDesc('puntos')
                    ->orderByDesc('id')
                    ->limit(self::POINTS_PER_QUERY)
                    ->get();

                foreach ($puntos as $punto) {
                    $cliente = $punto->cliente;
                    $cantidad = max(0, (int) $punto->puntos);

                    if ($cliente === null || $cantidad === 0) {
                        continue;
                    }

                    $esJuridica = strtolower($cliente->tipo_persona ?? 'natural') === 'juridica';
                    $nombre = trim(($cliente->nombre ?? '').' '.($cliente->apellidos ?? ''));
                    $documento = $esJuridica ? ($cliente->ruc ?? '-') : ($cliente->dni ?? '-');
                    $codigoBoleta = $punto->boleta?->codigo ?? '-';

                    for ($numeroBoleto = 1; $numeroBoleto <= $cantidad; $numeroBoleto++) {
                        $tickets[] = [
                            'tipoLabel' => $esJuridica ? 'Persona Jurídica' : 'Persona Natural',
                            'esJuridica' => $esJuridica,
                            'nombre' => $nombre,
                            'docVal' => $documento,
                            'email' => $cliente->email ?? '-',
                            'telefono' => $cliente->telefono ?? '-',
                            'departamento' => $cliente->departamento ?? '-',
                            'codigo' => $codigoBoleta,
                            'imagen' => $punto->imagen ?? '',
                            'tickNum' => $numeroBoleto,
                            'tickTotal' => $cantidad,
                        ];

                        if (count($tickets) === self::TICKETS_PER_PDF) {
                            $this->addPdfToZip($zip, $tickets, ++$pdfNumber);
                            $tickets = [];
                        }
                    }
                }

                if ($puntos->isNotEmpty()) {
                    $ultimoPunto = $puntos->last();
                    $lastPoints = (int) $ultimoPunto->puntos;
                    $lastId = (string) $ultimoPunto->id;
                }
            } while ($puntos->isNotEmpty());

            if ($tickets !== []) {
                $this->addPdfToZip($zip, $tickets, ++$pdfNumber);
            }

            $closed = $zip->close();
            $zipIsOpen = false;

            if (! $closed) {
                throw new \RuntimeException('No se pudo cerrar el ZIP generado.');
            }

            if (! rename($temporaryZipPath, $zipPath)) {
                throw new \RuntimeException('No se pudo publicar el ZIP generado.');
            }
        } catch (\Throwable $exception) {
            if ($zipIsOpen) {
                $zip->close();
            }

            if (is_file($temporaryZipPath) && ! unlink($temporaryZipPath)) {
                report(new \RuntimeException('No se pudo limpiar el ZIP temporal.', 0, $exception));
            }

            throw $exception;
        }
    }

    private function addPdfToZip(ZipArchive $zip, array $tickets, int $pdfNumber): void
    {
        $pdfContent = Pdf::loadView('reportes.boletos', ['tickets' => $tickets])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans',
                'dpi' => 150,
            ])
            ->output();

        $filename = sprintf('boletos_sorteo_%04d.pdf', $pdfNumber);

        if (! $zip->addFromString($filename, $pdfContent)) {
            throw new \RuntimeException("No se pudo agregar {$filename} al ZIP.");
        }
    }
}
