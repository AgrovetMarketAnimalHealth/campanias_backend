<?php

namespace App\Filters\Boleta;

use Closure;

class RangoFechaBoletaFilter{
    public function __construct(
        protected ?string $fechaDesde,
        protected ?string $fechaHasta
    ) {}
    public function handle($query, Closure $next){
        if ($this->fechaDesde) {
            $query->whereDate('created_at', '>=', $this->fechaDesde);
        }
        if ($this->fechaHasta) {
            $query->whereDate('created_at', '<=', $this->fechaHasta);
        }
        return $next($query);
    }
}
