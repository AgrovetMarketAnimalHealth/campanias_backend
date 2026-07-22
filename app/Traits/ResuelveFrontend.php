<?php

// app/Traits/ResuelveFrontend.php
namespace App\Traits;

trait ResuelveFrontend
{
    public function tipoConfig(): array
    {
        return config("services.registro_tipos.{$this->tipo_registro}")
            ?? config('services.registro_tipos.cliente'); // fallback
    }

    public function getFrontendUrlAttribute(): string
    {
        return $this->tipoConfig()['frontend_url'];
    }

    public function vista(string $nombre): string
    {
        return $this->tipoConfig()['vista_prefix'] . '.' . $nombre;
    }
}