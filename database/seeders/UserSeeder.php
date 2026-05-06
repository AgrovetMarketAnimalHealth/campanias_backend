<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'administrador')->first();
        $personalRole = Role::where('name', 'personal')->first();
        $permissions = Permission::all();

        if ($adminRole) {
            $adminRole->syncPermissions($permissions);
        }

        $campanias = DB::table('campanias')->pluck('id')->toArray();

        if (empty($campanias)) {
            $this->command->warn('No hay campañas disponibles. Ejecuta primero CampaniasSeeder.');
            $campaniaId = null;
        }

        $admin_1 = User::create([
            'name'             => 'Jefferson',
            'email'            => 'jeferson.covenas@agrovetmarket.com',
            'password'         => Hash::make('12345678'),
            'activo'           => true,
            'restablecimiento' => 0,
            'campania_id'      => $campanias[0] ?? null,
        ]);

        $admin_2 = User::create([
            'name'             => 'Thalia Grillo',
            'email'            => 'thalia.grillo@agrovetmarket.com',
            'password'         => Hash::make('12345678'),
            'activo'           => true,
            'restablecimiento' => 0,
            'campania_id'      => $campanias[1] ?? ($campanias[0] ?? null),
        ]);

        $admin_3 = User::create([
            'name'             => 'Lionela Barrios',
            'email'            => 'leonela.barrios@stpbpo.com',
            'password'         => Hash::make('12345678'),
            'activo'           => true,
            'restablecimiento' => 0,
            'campania_id'      => $campanias[2] ?? ($campanias[0] ?? null),
        ]);

        $admin_1->assignRole($adminRole);
        $admin_2->assignRole($adminRole);
        $admin_3->assignRole($personalRole);

        $users = [$admin_1, $admin_2, $admin_3];

        foreach ($users as $user) {
            $plainToken = \Illuminate\Support\Str::random(64);

            $existingToken = DB::table('password_reset_tokens')->where('email', $user->email)->first();
            if (!$existingToken) {
                DB::table('password_reset_tokens')->insert([
                    'email'      => $user->email,
                    'token'      => Hash::make($plainToken),
                    'created_at' => now(),
                ]);
            } else {
                DB::table('password_reset_tokens')->where('email', $user->email)->update([
                    'token'      => Hash::make($plainToken),
                    'created_at' => now(),
                ]);
            }
            $this->command->info("Token para {$user->email}: {$plainToken}");
        }
        
        $this->command->info('Usuarios creados correctamente:');
        $this->command->info('- Jefferson (administrador)');
        $this->command->info('- Thalia Grillo (administrador)');
        $this->command->info('- Lionela Barrios (personal)');
    }
}