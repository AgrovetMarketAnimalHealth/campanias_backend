<?php

namespace App\Providers;

use App\Models\campanias;
use App\Observers\CampaniasObserver;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider{
    public function boot(): void{
        campanias::observe(CampaniasObserver::class);
    }
}
