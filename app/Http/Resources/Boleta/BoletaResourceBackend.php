<?php

namespace App\Http\Resources\Boleta;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class BoletaResourceBackend extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'cliente_id'       => $this->cliente_id,
            'cliente_tipo'     => $this->cliente->tipo_persona,
            'cliente_dni'      => $this->cliente->dni,
            'cliente_ruc'      => $this->cliente->ruc,
            'cliente_nom'      => $this->cliente->nombre . ' ' . $this->cliente->apellidos,
            'codigo'           => $this->codigo,
            'archivo'          => $this->resolverUrlArchivo(),
            'puntos_otorgados' => $this->puntos_otorgados ?? 0,
            'estado'           => $this->estado,
            'observacion'      => $this->observacion ?? '-',
            'created_at'       => Carbon::parse($this->created_at)->format('d-m-Y H:i:s A'),
            'updated_at'       => $this->updated_at
                ? Carbon::parse($this->updated_at)->format('d-m-Y h:i:s A')
                : null,
        ];
    }

    private function resolverUrlArchivo(): ?string
    {
        if (!$this->archivo) {
            return null;
        }

        $rutaFisica = public_path($this->archivo);
        if (!file_exists($rutaFisica)) {
            return null;
        }

        return asset($this->archivo);
    }
}