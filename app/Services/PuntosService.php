<?php

namespace App\Services;

use App\Models\Boleta;
use App\Models\Punto;

class PuntosService{
    public function acreditar(Boleta $boleta, float $puntos): Punto{
        return Punto::create([
            'cliente_id'  => $boleta->cliente_id,
            'boleta_id'   => $boleta->id,
            'puntos'      => round($puntos, 2),
            'descripcion' => "Puntos acreditados por boleta #{$boleta->codigo}",
        ]);
    }
    public function totalCliente(string $clienteId): float{
        return (float) Punto::where('cliente_id', $clienteId)->sum('puntos');
    }
}
