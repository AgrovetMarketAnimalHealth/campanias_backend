<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class AuditUserService{
    public function setCreatedBy(Model $model): Model{
        if (Auth::check() && !$model->created_by) {
            $model->created_by = Auth::id();
        }
        return $model;
    }
    public function setUpdatedBy(Model $model): Model{
        if (Auth::check()) {
            $model->updated_by = Auth::id();
        }
        return $model;
    }
    public function setDeletedBy(Model $model): Model{
        if (Auth::check()) {
            $model->deleted_by = Auth::id();
        }
        return $model;
    }
    public function applyAuditFields(Model $model, string $operation = 'create'): Model{
        switch ($operation) {
            case 'create':
                $this->setCreatedBy($model);
                $this->setUpdatedBy($model);
                break;
            case 'update':
                $this->setUpdatedBy($model);
                break;
            case 'delete':
                $this->setDeletedBy($model);
                break;
        }
        return $model;
    }
}