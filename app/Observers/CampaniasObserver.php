<?php

namespace App\Observers;

use App\Models\campanias;
use App\Services\AuditUserService;
use Illuminate\Support\Facades\Auth;

class CampaniasObserver{
    protected $auditService;
    public function __construct(AuditUserService $auditService){
        $this->auditService = $auditService;
    }
    public function creating(campanias $campanias): void{
        if (Auth::check()) {
            $campanias->created_by = Auth::id();
            $campanias->updated_by = Auth::id();
        }
    }
    public function updating(campanias $campanias): void{
        if (Auth::check()) {
            $campanias->updated_by = Auth::id();
        }
    }
    public function deleting(campanias $campanias): void
    {
        if (Auth::check()) {
            $campanias->deleted_by = Auth::id();
            $campanias->save();
        }
    }
    public function restoring(campanias $campanias): void
    {
        $campanias->deleted_by = null;
    }
}