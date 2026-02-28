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
            'archivo_url'      => $this->resolverUrlArchivo(),
            'fecha'            => $this->created_at?->format('d/m/Y H:i'),
        ];
    }

    private function resolverUrlArchivo(): ?string
    {
        if (!$this->archivo) {
            return asset('img/images.png');
        }

        if (!Storage::disk('public')->exists($this->archivo)) {
            return asset('img/images.png');
        }

        return Storage::disk('public')->url($this->archivo);
    }
}