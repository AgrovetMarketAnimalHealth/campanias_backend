<?php

namespace App\Http\Resources\Punto;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientePuntoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->cliente_id,
            'imagen'               => asset('/promo-concierto/backoffice/img/logo-atrevia.webp'),
            'puntos'               => (int) $this->puntos,
            'cliente_id'           => $this->cliente_id,
            'cliente_tipo'         => $this->cliente->tipo_persona,
            'cliente_nom'          => $this->cliente->nombre,
            'cliente_apl'          => $this->cliente->apellidos,
            'cliente_dni'          => $this->cliente->dni,
            'cliente_ruc'          => $this->cliente->ruc,
            'cliente_email'        => $this->cliente->email,
            'cliente_departamento' => $this->cliente->departamento,
            'telefono'             => $this->cliente->telefono,
            'cliente_estado'       => $this->cliente->estado,
        ];
    }
}
