<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder{
    /**
     * Run the database seeds.
     */
    public function run(): void{
        #Puntos
        Permission::create(['name' => 'ver puntos']);
        Permission::create(['name' => 'crear puntos']);
        Permission::create(['name' => 'editar puntos']);
        Permission::create(['name' => 'eliminar puntos']);

        #Boletas
        Permission::create(['name' => 'ver boletas']);
        Permission::create(['name' => 'crear boletas']);
        Permission::create(['name' => 'editar boletas']);
        Permission::create(['name' => 'eliminar boletas']);

        #Clientes
        Permission::create(['name' => 'ver clientes']);
        Permission::create(['name' => 'crear clientes']);
        Permission::create(['name' => 'editar clientes']);
        Permission::create(['name' => 'eliminar clientes']);

        #Notificaciones
        Permission::create(['name' => 'ver notificaciones']);
        Permission::create(['name' => 'crear notificaciones']);
        Permission::create(['name' => 'editar notificaciones']);
        Permission::create(['name' => 'eliminar notificaciones']);

        #Usuarios
        Permission::create(['name' => 'ver usuarios']);
        Permission::create(['name' => 'crear usuarios']);
        Permission::create(['name' => 'editar usuarios']);
        Permission::create(['name' => 'eliminar usuarios']);

        #Roles
        Permission::create(['name' => 'ver roles']);
        Permission::create(['name' => 'crear roles']);
        Permission::create(['name' => 'editar roles']);
        Permission::create(['name' => 'eliminar roles']);

        #Permisos
        Permission::create(['name' => 'ver permisos']);
        Permission::create(['name' => 'crear permisos']);
        Permission::create(['name' => 'editar permisos']);
        Permission::create(['name' => 'eliminar permisos']);
    }
}