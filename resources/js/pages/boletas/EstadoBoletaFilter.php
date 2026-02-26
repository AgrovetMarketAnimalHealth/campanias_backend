<?php

namespace App\Filters\Boleta;

use Closure;

class EstadoBoletaFilter
{
    public function __construct(protected ?string $estado) {}

    public function handle($query, Closure $next)
    {
        // Si es nulo, vacío o 'todos', no filtra
        if (!$this->estado || $this->estado === 'todos') {
            return $next($query);
        }

        return $next($query->where('estado', $this->estado));
    }
}