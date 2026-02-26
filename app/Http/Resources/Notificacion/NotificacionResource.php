<?php

namespace App\Http\Resources\Notificacion;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificacionResource extends JsonResource{
    public function toArray($request): array{
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'tipo_texto' => $this->getTipoTexto(),
            'asunto' => $this->asunto,
            'cuerpo' => $this->cuerpo,
            'leida' => !is_null($this->leido_at),
            'leido_at' => $this->leido_at?->format('Y-m-d H:i:s'),
            'enviado_at' => $this->enviado_at?->format('Y-m-d H:i:s'),
            'fecha_formateada' => $this->enviado_at?->diffForHumans(),
            'boleta' => $this->when($this->boleta_id, [
                'id' => $this->boleta_id,
                'codigo' => $this->boleta?->codigo,
            ]),
        ];
    }
    private function getTipoTexto(): string{
        return match($this->tipo) {
            'boleta_aceptada' => 'Boleta Aceptada',
            'boleta_rechazada' => 'Boleta Rechazada',
            'boleta_pendiente' => 'Boleta Pendiente',
            'puntos_acreditados' => 'Puntos Acreditados',
            default => $this->tipo,
        };
    }
}