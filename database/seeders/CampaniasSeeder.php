<?php

namespace Database\Seeders;

use App\Models\Campanias;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CampaniasSeeder extends Seeder
{
    public function run(): void
    {
        Campanias::forceCreate([
            'id'          => Str::uuid(),
            'nombre'      => 'Campaña Verano 2025',
            'dominio'     => 'https://verano2025.example.com',
            'activa'      => true,
            'created_by'  => 1,
            'updated_by'  => 1,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }
}