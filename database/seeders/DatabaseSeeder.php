<?php

namespace Database\Seeders;

use CampaniasSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            CampaniasSeeder::class,
            UserSeeder::class,
        ]);
    }
}