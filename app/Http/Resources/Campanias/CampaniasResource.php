<?php

namespace App\Http\Resources\Campanias;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaniasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'dominio' => $this->dominio,
            'activa' => $this->activa,
            'created_at' => $this->created_at?->format('d-m-Y H:i:s A'),
            'updated_at' => $this->updated_at?->format('d-m-Y H:i:s A'),
        ];
    }
}