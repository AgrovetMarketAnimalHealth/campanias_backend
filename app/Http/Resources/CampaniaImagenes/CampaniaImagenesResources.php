<?php

namespace App\Http\Resources\CampaniaImagenes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CampaniaImagenesResources extends JsonResource{
    public function toArray(Request $request): array{
        return [
            'id'              => $this->id,
            'campania_id'     => $this->campania_id,
            'seccion'         => $this->seccion,
            'orden'           => $this->orden,

            'imagen_desktop'  => $this->urlImagen($this->imagen_desktop),
            'imagen_tablet'   => $this->urlImagen($this->imagen_tablet),
            'imagen_mobile'   => $this->urlImagen($this->imagen_mobile),

            'visible_desktop' => $this->visible_desktop,
            'visible_tablet'  => $this->visible_tablet,
            'visible_mobile'  => $this->visible_mobile,

            'activa'          => $this->activa,

            'created_at' => $this->created_at?->format('d-m-Y H:i:s A'),
            'updated_at' => $this->updated_at?->format('d-m-Y H:i:s A'),
        ];
    }
    private function urlImagen(?string $ruta): ?string{
        if (! $ruta) {
            return null;
        }
        return Storage::disk('public')->url($ruta);
    }
}
