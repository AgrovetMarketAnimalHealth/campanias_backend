<?php

namespace App\Http\Resources\Cliente;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'nombre'             => $this->nombre,
            'apellidos'          => $this->apellidos,
            'departamento'       => $this->departamento,
            'dni'                => $this->dni,
            'ruc'                => $this->ruc,
            'ce'                 => $this->ce,
            'tipo_persona'       => $this->tipo_persona,
            'email'              => $this->email,
            'telefono'           => $this->telefono,
            'estado'             => $this->estado,
            'email_verificado'   => !is_null($this->email_verified_at),
            //'total_puntos'       => $this->totalPuntos(),
            'total_puntos' => (int) ($this->total_puntos ?? 0),
            'boletas_aceptadas'  => $this->boletas_aceptadas,
            'boletas_pendientes' => $this->boletas_pendientes,
            'boletas_rechazadas' => $this->boletas_rechazadas,
            'registrado_en'      => $this->created_at?->format('d/m/Y'),
            'ganador'            => $this->ganador,
            'campanias'          => $this->when(
                $this->relationLoaded('clienteCampanias'),
                function () {
                    $campanias = $this->clienteCampanias
                        ->filter(fn($clienteCampania) => $clienteCampania->campania)
                        ->map(fn($clienteCampania) => $clienteCampania->campania);

                    if ($this->relationLoaded('boletas')) {
                        $campanias = $campanias
                            ->merge($this->boletas->map(fn($boleta) => $boleta->campania))
                            ->filter();
                    }

                    return $campanias->unique('id')->map(fn($campania) => [
                        'id'     => $campania->id,
                        'nombre' => $campania->nombre,
                        'url'    => $campania->url,
                        'activa' => (bool) $campania->activa,
                    ])->values();
                }
            ),
        ];
    }
}