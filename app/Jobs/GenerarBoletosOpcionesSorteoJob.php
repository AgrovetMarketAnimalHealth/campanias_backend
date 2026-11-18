<?php

namespace App\Jobs;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class GenerarBoletosOpcionesSorteoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const TICKETS_PER_PDF = 500;

    public int $timeout = 0;

    public int $tries = 2;

    public function __construct(
        public readonly string $zipFilename,
        public readonly array $distribuidores
    ) {}

    public function handle(): void
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory('sorteo');

        if (basename($this->zipFilename) !== $this->zipFilename) {
            throw new \InvalidArgumentException('El nombre del ZIP no es válido.');
        }

        $zipPath = $disk->path('sorteo/'.$this->zipFilename);
        $temporaryZipPath = $zipPath.'.'.Str::uuid().'.tmp';
        $zip = new ZipArchive;
        $zipIsOpen = false;

        try {
            $result = $zip->open($temporaryZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            if ($result !== true) {
                throw new \RuntimeException("No se pudo crear el ZIP temporal (código {$result}).");
            }

            $zipIsOpen = true;
            $tickets = [];
            $pdfNumber = 0;
            $numeroOpcion = 0;

            foreach ($this->distribuidores as $distribuidor) {
                $cantidad = (int) $distribuidor['opciones_sorteo'];

                for ($numeroBoleto = 1; $numeroBoleto <= $cantidad; $numeroBoleto++) {
                    $tickets[] = [
                        'tipoLabel' => 'Opción de sorteo',
                        'esJuridica' => true,
                        'opcionesSorteo' => true,
                        'distribuidor' => $distribuidor['distribuidor_razon_social'],
                        'nombre' => $distribuidor['representante'],
                        'docVal' => $distribuidor['ruc'],
                        'email' => '-',
                        'telefono' => $distribuidor['celular'],
                        'departamento' => '-',
                        'codigo' => 'OPC-'.str_pad((string) ++$numeroOpcion, 6, '0', STR_PAD_LEFT),
                        'imagen' => '',
                        'tickNum' => $numeroBoleto,
                        'tickTotal' => $cantidad,
                    ];

                    if (count($tickets) === self::TICKETS_PER_PDF) {
                        $this->addPdfToZip($zip, $tickets, ++$pdfNumber);
                        $tickets = [];
                    }
                }
            }

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
