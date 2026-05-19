<?php

namespace Database\Seeders;

use App\Models\Campania;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CampaniaSeeder extends Seeder
{
    public function run(): void
    {
        Campania::create([
            'nombre'  => 'Promo Concierto',
            'url'     => 'promo-concierto',
            'api_key' => Str::random(64),
            'activa'  => true,
        ]);
    }
}