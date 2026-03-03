<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder{
    public function run(): void{
        $adminRole = Role::where('name', 'administrador')->first();
        $personalRole = Role::where('name', 'personal')->first();
        $permissions = Permission::all();
        if ($adminRole) {
            $adminRole->syncPermissions($permissions);
        }

        $admin_1 = User::create([
            'name' => 'Jefferson',
            'email' => 'jeferson.covenas@agrovetmarket.com',
            'password' => Hash::make('12345678'),
            'activo' => true,
            'restablecimiento' => 0,
        ]);
        $admin_2 = User::create([
            'name' => 'Thalia Grillo',
            'email' => 'thalia.grillo@agrovetmarket.com',
            'password' => Hash::make('12345678'),
            'activo' => true,
            'restablecimiento' => 0,
        ]);
        $admin_3 = User::create([
            'name' => 'Lionela Barrios',
            'email' => 'leonela.barrios@stpbpo.com',
            'password' => Hash::make('12345678'),
            'activo' => true,
            'restablecimiento' => 0,
        ]);

        $admin_1->assignRole($adminRole);
        $admin_2->assignRole($adminRole);
        $admin_3->assignRole($personalRole);
    }
}