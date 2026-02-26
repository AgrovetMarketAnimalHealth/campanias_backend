<?php

namespace App\Filters\Boleta;

use Closure;

class EstadoBoletaFilter{
    public function __construct(protected ?string $estado) {}
    public function handle($query, Closure $next){
        if (!$this->estado) return $next($query);
        return $next($query->where('estado', $this->estado));
    }
}
