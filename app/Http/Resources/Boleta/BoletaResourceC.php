<?php

namespace App\Http\Resources\Boleta;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BoletaResourceC extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'codigo'           => $this->codigo,
            'numero_boleta'    => $this->numero_boleta,
            'monto'            => $this->monto,
            'puntos_otorgados' => $this->puntos_otorgados,
            'estado'           => $this->estado,
            'observacion'      => $this->observacion,
            'archivo_url'      => $this->archivo
                                    ? Storage::disk('s3')->temporaryUrl($this->archivo, now()->addMinutes(30))
                                    : null,
            'fecha'            => $this->created_at?->format('d/m/Y H:i'),
        ];
    }
}