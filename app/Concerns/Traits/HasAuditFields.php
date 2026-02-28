<?php

namespace App\Concerns\Traits;

use Illuminate\Support\Facades\Auth;
use App\Models\Cliente;

trait HasAuditFields
{
    public static function bootHasAuditFields(): void
    {
        static::creating(function ($model) {
            $id = self::getAuditUserId();
            $model->created_by = $id;
            $model->updated_by = $id;
        });

        static::updating(function ($model) {
            $model->updated_by = self::getAuditUserId();
        });

        static::deleting(function ($model) {
            if (method_exists($model, 'runSoftDelete')) {
                $model->deleted_by = self::getAuditUserId();
                $model->saveQuietly();
            }
        });
    }

    /**
     * Devuelve el ID del usuario admin autenticado.
     * Retorna null si el autenticado es un Cliente (UUID, no bigint).
     */
    private static function getAuditUserId(): ?int
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user || $user instanceof Cliente) {
            return null;
        }

        return $user->id;
    }
}