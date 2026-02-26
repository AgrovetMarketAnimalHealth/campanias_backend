<?php

namespace App\Http\Resources\Boleta;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class BoletaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'codigo'           => $this->codigo,
            'archivo'          => $this->archivo
                ? Storage::disk('s3')->url($this->archivo)
                : null,
            'puntos_otorgados' => $this->puntos_otorgados,
            'estado'           => $this->estado,
            'observacion'      => $this->observacion,
            'created_at' => Carbon::parse($this->created_at)->format('d-m-Y H:i:s A'),
            'updated_at' => $this->updated_at
                ? Carbon::parse($this->updated_at)->format('d-m-Y h:i:s A')
                : null,
        ];
    }
}
