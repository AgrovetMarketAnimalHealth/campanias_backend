<?php

namespace App\Filters\Boleta;

use Closure;

class SearchBoletaFilter{
    public function __construct(protected string $search) {}
    public function handle($query, Closure $next){
        if (!$this->search) return $next($query);
        $search = $this->search;
        return $next($query->where(function ($q) use ($search) {
            $q->where('codigo', 'like', "%{$search}%")
              ->orWhere('observacion', 'like', "%{$search}%")
              ->orWhereHas('cliente', fn($c) => $c
                  ->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('ruc', 'like', "%{$search}%")
                  ->orWhere('tipo_persona', 'like', "%{$search}%")
              );
        }));
    }
}