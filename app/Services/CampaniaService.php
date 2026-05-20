<?php

namespace App\Services;

use App\Models\Campania;
use Illuminate\Support\Str;
class CampaniaService
{
    public function crear(
    string $nombre,
        string $url,
        bool   $activa,
    ): Campania {
        return Campania::create([
            'nombre'  => $nombre,
            'url'     => $url,
            'api_key' => Str::uuid(), // o Str::random(40)
            'activa'  => $activa,
        ]);
    }

    public function actualizar(
        Campania $campania,
        string   $nombre,
        string   $url,
        bool     $activa,
    ): Campania {
        $campania->update([
            'nombre'  => $nombre,
            'url'     => $url,
            'api_key' => $campania->api_key,
            'activa'  => $activa,
        ]);

        return $campania;
    }

    public function eliminar(Campania $campania): void
    {
        $campania->delete();
    }
}