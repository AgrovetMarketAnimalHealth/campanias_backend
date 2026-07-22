<?php

namespace App\Services;

use App\Jobs\EnviarEmailBoletaAceptada;
use App\Jobs\EnviarEmailBoletaRechazada;
use App\Models\Boleta;
use Illuminate\Support\Facades\DB;

class BoletaService
{
    public function __construct(
        private readonly PuntosService $puntosService,
    ) {}

    public function aceptar(
        Boleta  $boleta,
        int     $puntos,
        float   $monto,
        string  $numeroBoleta,
        string  $rucVeterinaria,
        ?string $observacion = null,
    ): Boleta {
        return DB::transaction(function () use ($boleta, $puntos, $monto, $numeroBoleta, $rucVeterinaria, $observacion) {
            if ($boleta->estado !== 'pendiente') {
                throw new \Exception('La boleta ya fue procesada.');
            }

            // Defensa adicional: valida el mínimo dinámico de la campaña
            // aunque ya haya pasado por el FormRequest (protege llamadas
            // desde jobs, comandos artisan, etc.)
            if ($monto < $boleta->montoMinimoParaAceptar()) {
                throw new \Exception(sprintf(
                    'El monto no cumple el mínimo requerido para esta campaña (S/ %s).',
                    number_format($boleta->montoMinimoParaAceptar(), 2)
                ));
            }

            $duplicada = Boleta::where('numero_boleta', $numeroBoleta)
                ->where('ruc_veterinaria', $rucVeterinaria)
                ->where('estado', 'aceptada')
                ->where('id', '!=', $boleta->id)
                ->exists();

            if ($duplicada) {
                $boleta->updateQuietly([
                    'estado'          => 'rechazada',
                    'monto'           => $monto,
                    'numero_boleta'   => $numeroBoleta,
                    'ruc_veterinaria' => $rucVeterinaria,
                    'observacion'     => 'Comprobante rechazado automáticamente: el número de boleta ya fue aceptado previamente para esta veterinaria.',
                ]);
                dispatch(new EnviarEmailBoletaRechazada($boleta))->onQueue('emails');
                return $boleta;
            }

            $boleta->updateQuietly([
                'estado'           => 'aceptada',
                'puntos_otorgados' => $puntos,
                'monto'            => $monto,
                'numero_boleta'    => $numeroBoleta,
                'ruc_veterinaria'  => $rucVeterinaria,
                'observacion'      => $observacion,
            ]);

            $this->puntosService->acreditar($boleta, $puntos);
            dispatch(new EnviarEmailBoletaAceptada($boleta))->onQueue('emails');

            return $boleta;
        });
    }

    public function rechazar(
        Boleta  $boleta,
        string  $observacion,
        float   $monto,
        string  $numeroBoleta,
        string  $rucVeterinaria,
    ): Boleta {
        return DB::transaction(function () use ($boleta, $observacion, $monto, $numeroBoleta, $rucVeterinaria) {
            if ($boleta->estado !== 'pendiente') {
                throw new \Exception('La boleta ya fue procesada.');
            }

            $boleta->updateQuietly([
                'estado'          => 'rechazada',
                'monto'           => $monto,
                'numero_boleta'   => $numeroBoleta,
                'ruc_veterinaria' => $rucVeterinaria,
                'observacion'     => $observacion,
            ]);

            dispatch(new EnviarEmailBoletaRechazada($boleta))->onQueue('emails');

            return $boleta;
        });
    }
}