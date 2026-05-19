<?php

namespace App\Filters\Campania;

use Closure;
use Illuminate\Database\Eloquent\Builder;

class EstadoCampaniaFilter
{
    public function __construct(
        private readonly mixed $activa
    ) {}

    public function handle(Builder $query, Closure $next): Builder
    {
        if (!is_null($this->activa) && $this->activa !== '') {
            $query->where('activa', filter_var($this->activa, FILTER_VALIDATE_BOOLEAN));
        }

        return $next($query);
    }
}