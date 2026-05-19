<?php

namespace App\Filters\Campania;

use Closure;
use Illuminate\Database\Eloquent\Builder;

class NombreCampaniaFilter
{
    public function __construct(
        private readonly ?string $nombre
    ) {}

    public function handle(Builder $query, Closure $next): Builder
    {
        if (filled($this->nombre)) {
            $query->where('nombre', 'like', "%{$this->nombre}%");
        }

        return $next($query);
    }
}