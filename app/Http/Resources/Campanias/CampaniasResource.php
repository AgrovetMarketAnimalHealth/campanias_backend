<?php

namespace App\Http\Resources\Campanias;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaniasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'nombre'     => $this->nombre,
            'url'        => $this->url,
            'activa'     => $this->activa,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}