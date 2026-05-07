<?php

namespace App\Filters\Campania;

use Illuminate\Database\Eloquent\Builder;

class RangoFechaCampaniaFilter
{
    public function __construct(
        private readonly ?string $desde,
        private readonly ?string $hasta,
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->desde) {
            $query->whereDate('fecha_inicio', '>=', $this->desde);
        }
        if ($this->hasta) {
            $query->whereDate('fecha_fin', '<=', $this->hasta);
        }
        return $next($query);
    }
}