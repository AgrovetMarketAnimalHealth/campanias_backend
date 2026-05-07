<?php

namespace App\Filters\Campania;

use Illuminate\Database\Eloquent\Builder;

class ActivaCampaniaFilter
{
    public function __construct(private readonly ?string $activa) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if (!is_null($this->activa)) {
            $query->where('activa', filter_var($this->activa, FILTER_VALIDATE_BOOLEAN));
        }
        return $next($query);
    }
}