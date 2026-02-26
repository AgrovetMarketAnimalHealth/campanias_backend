<?php

namespace App\Concerns\Traits;

use Illuminate\Support\Facades\Auth;

trait HasAuditFields
{
    public static function bootHasAuditFields(): void
    {
        static::creating(function ($model) {
            $model->created_by = Auth::id();
            $model->updated_by = Auth::id();
        });

        static::updating(function ($model) {
            $model->updated_by = Auth::id();
        });

        static::deleting(function ($model) {
            if (method_exists($model, 'runSoftDelete')) {
                $model->deleted_by = Auth::id();
                $model->saveQuietly();
            }
        });
    }
}
