<?php

namespace App\Http\Resources\Boleta;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BoletaResourceBackend extends JsonResource{
    public function toArray(Request $request): array{
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
    private function resolverUrlArchivo(): ?string{
        if (!$this->archivo) {
            return null;
        }
        $disco = Storage::build([
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION'),
            'bucket'                  => env('AWS_BUCKET'),
            'url'                     => env('AWS_URL'),
            'endpoint'                => env('AWS_URL'),
            'use_path_style_endpoint' => true,
        ]);
        return $disco->temporaryUrl($this->archivo, now()->addMinutes(60));
    }
}
