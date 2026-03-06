<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE notificaciones
            MODIFY COLUMN tipo ENUM(
                'registro_cliente',
                'registro_admin',
                'boleta_recibida',
                'boleta_aceptada',
                'boleta_rechazada',
                'boleta_pendiente',
                'puntos_acreditados',
                'bienvenida',
                'reenvio_verificacion',
                'sesion_sospechosa'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE notificaciones
            MODIFY COLUMN tipo ENUM(
                'registro_cliente',
                'registro_admin',
                'boleta_recibida',
                'boleta_aceptada',
                'boleta_rechazada',
                'boleta_pendiente',
                'puntos_acreditados',
                'bienvenida',
                'reenvio_verificacion'
            ) NOT NULL
        ");
    }
};