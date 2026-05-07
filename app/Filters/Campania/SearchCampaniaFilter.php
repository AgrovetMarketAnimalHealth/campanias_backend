<?php

namespace App\Filters\Campania;

use Illuminate\Database\Eloquent\Builder;

class SearchCampaniaFilter
{
    public function __construct(private readonly ?string $search) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->search) {
            $query->where(fn($q) => $q
                ->where('nombre', 'like', "%{$this->search}%")
                ->orWhere('dominio', 'like', "%{$this->search}%")
            );
        }
        return $next($query);
    }
}