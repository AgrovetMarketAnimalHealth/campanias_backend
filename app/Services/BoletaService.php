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

    public function aceptar(Boleta $boleta, int $puntos, float $monto, string $numeroBoleta, ?string $observacion = null): Boleta
    {
        return DB::transaction(function () use ($boleta, $puntos, $monto, $numeroBoleta, $observacion) {
            if ($boleta->estado !== 'pendiente') {
                throw new \Exception('La boleta ya fue procesada.');
            }

            $boleta->update([
                'estado'          => 'aceptada',
                'puntos_otorgados' => $puntos,
                'monto'           => $monto,
                'numero_boleta'   => $numeroBoleta,
                'observacion'     => $observacion,
            ]);

            $this->puntosService->acreditar($boleta, $puntos);

            dispatch(new EnviarEmailBoletaAceptada($boleta));

            return $boleta;
        });
    }

    public function rechazar(Boleta $boleta, string $observacion, float $monto, string $numeroBoleta): Boleta
    {
        return DB::transaction(function () use ($boleta, $observacion, $monto, $numeroBoleta) {
            if ($boleta->estado !== 'pendiente') {
                throw new \Exception('La boleta ya fue procesada.');
            }

            $boleta->update([
                'estado'        => 'rechazada',
                'monto'         => $monto,
                'numero_boleta' => $numeroBoleta,
                'observacion'   => $observacion,
            ]);

            dispatch(new EnviarEmailBoletaRechazada($boleta));

            return $boleta;
        });
    }
}