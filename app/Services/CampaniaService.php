<?php

namespace App\Services;

use App\Models\Campanias;
use Illuminate\Support\Facades\Auth;

class CampaniaService{
    public function crear(array $data): Campanias{
        return Campanias::create([
            ...$data,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);
    }
    public function actualizar(Campanias $campania, array $data): Campanias{
        $campania->update([
            ...$data,
            'updated_by' => Auth::id(),
        ]);
        return $campania->fresh();
    }
    public function eliminar(Campanias $campania): void{
        $campania->update([
            'deleted_by' => Auth::id(),
        ]);
        $campania->delete();
    }
    public function toggleActiva(Campanias $campania): Campanias{
        $campania->update([
            'activa' => !$campania->activa,
            'updated_by' => Auth::id(),
        ]);
        return $campania->fresh();
    }
}