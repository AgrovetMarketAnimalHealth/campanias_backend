<?php

namespace App\Services;

use App\Models\Campania;

class CampaniaService
{
    public function crear(
        string $nombre,
        string $url,
        string $apiKey,
        bool   $activa,
    ): Campania {
        return Campania::create([
            'nombre'  => $nombre,
            'url'     => $url,
            'api_key' => $apiKey,
            'activa'  => $activa,
        ]);
    }

    public function actualizar(
        Campania $campania,
        string   $nombre,
        string   $url,
        string   $apiKey,
        bool     $activa,
    ): Campania {
        $campania->update([
            'nombre'  => $nombre,
            'url'     => $url,
            'api_key' => $apiKey,
            'activa'  => $activa,
        ]);

        return $campania;
    }

    public function eliminar(Campania $campania): void
    {
        $campania->delete();
    }
}