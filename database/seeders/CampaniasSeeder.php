<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CampaniasSeeder extends Seeder
{
    public function run(): void
    {
        $campanias = [
            [
                'id'          => Str::uuid(),
                'nombre'      => 'Campaña Verano 2025',
                'slug'        => 'verano-2025',
                'descripcion' => 'Campaña de verano para clientes con mascotas. Acumula puntos con cada compra en veterinarias participantes.',
                'estado'      => 'activa',
                'fecha_inicio' => '2026-01-01',
                'fecha_fin'    => '2026-12-31',
                'activa'       => true,
                'configuracion' => json_encode([
                    'max_boletas_por_cliente' => 10,
                    'monto_minimo_boleta'     => 50.00,
                    'permite_multiple_registro' => false,

                    'documentos_aceptados' => ['dni', 'carnet_extranjeria', 'pasaporte'],

                    'veterinarias_participantes' => [
                        'habilitado'      => true,
                        'ruc_lista_blanca' => [],
                    ],

                    'ganadores' => [
                        'cantidad'               => 3,
                        'permite_repetir_ganador' => false,
                        'sorteo_automatico'       => false,
                    ],

                    'registro' => [
                        'requiere_comprobante'       => true,
                        'campos_extra'               => ['raza_mascota', 'nombre_mascota'],
                        'departamentos_habilitados'  => ['Lima', 'Arequipa', 'Cusco', 'La Libertad'],
                    ],

                    'puntos' => [
                        'multiplicador'    => 1,
                        'puntos_bienvenida' => 50,
                        'expiran'          => false,
                        'dias_expiracion'  => null,
                    ],

                    'notificaciones' => [
                        'email_bienvenida'        => true,
                        'email_puntos_acreditados' => true,
                        'dias_reporte'            => ['lunes', 'viernes'],
                    ],

                    'ui' => [
                        'color_primario'          => '#F59E0B',
                        'color_secundario'        => '#FDE68A',
                        'fuente'                  => 'Poppins',
                        'mostrar_ranking'         => true,
                        'mostrar_contador_boletas' => true,
                    ],
                ]),
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id'          => Str::uuid(),
                'nombre'      => 'Campaña Invierno 2025',
                'slug'        => 'invierno-2025',
                'descripcion' => 'Campaña de invierno con doble puntos en compras mayores a S/. 100.',
                'estado'      => 'borrador',
                'fecha_inicio' => '2025-06-01',
                'fecha_fin'    => '2025-08-31',
                'activa'       => false,
                'configuracion' => json_encode([
                    'max_boletas_por_cliente' => 20,
                    'monto_minimo_boleta'     => 100.00,
                    'permite_multiple_registro' => false,

                    'documentos_aceptados' => ['dni', 'carnet_extranjeria'],

                    'veterinarias_participantes' => [
                        'habilitado'      => true,
                        'ruc_lista_blanca' => [],
                    ],

                    'ganadores' => [
                        'cantidad'               => 5,
                        'permite_repetir_ganador' => false,
                        'sorteo_automatico'       => false,
                    ],

                    'registro' => [
                        'requiere_comprobante'       => true,
                        'campos_extra'               => ['nombre_mascota'],
                        'departamentos_habilitados'  => [], // vacío = todos
                    ],

                    'puntos' => [
                        'multiplicador'    => 2,  // doble puntos
                        'puntos_bienvenida' => 100,
                        'expiran'          => true,
                        'dias_expiracion'  => 90,
                    ],

                    'notificaciones' => [
                        'email_bienvenida'        => true,
                        'email_puntos_acreditados' => true,
                        'dias_reporte'            => ['lunes'],
                    ],

                    'ui' => [
                        'color_primario'          => '#3B82F6',
                        'color_secundario'        => '#BFDBFE',
                        'fuente'                  => 'Inter',
                        'mostrar_ranking'         => false,
                        'mostrar_contador_boletas' => true,
                    ],
                ]),
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id'          => Str::uuid(),
                'nombre'      => 'Campaña Aniversario 2024',
                'slug'        => 'aniversario-2024',
                'descripcion' => 'Campaña especial por aniversario de la marca. Ya finalizada.',
                'estado'      => 'finalizada',
                'fecha_inicio' => '2024-09-01',
                'fecha_fin'    => '2024-11-30',
                'activa'       => false,
                'configuracion' => json_encode([
                    'max_boletas_por_cliente' => 5,
                    'monto_minimo_boleta'     => 30.00,
                    'permite_multiple_registro' => false,

                    'documentos_aceptados' => ['dni'],

                    'veterinarias_participantes' => [
                        'habilitado'      => false,
                        'ruc_lista_blanca' => [],
                    ],

                    'ganadores' => [
                        'cantidad'               => 1,
                        'permite_repetir_ganador' => false,
                        'sorteo_automatico'       => true,
                    ],

                    'registro' => [
                        'requiere_comprobante'       => true,
                        'campos_extra'               => [],
                        'departamentos_habilitados'  => ['Lima'],
                    ],

                    'puntos' => [
                        'multiplicador'    => 3,
                        'puntos_bienvenida' => 200,
                        'expiran'          => true,
                        'dias_expiracion'  => 60,
                    ],

                    'notificaciones' => [
                        'email_bienvenida'        => true,
                        'email_puntos_acreditados' => false,
                        'dias_reporte'            => ['viernes'],
                    ],

                    'ui' => [
                        'color_primario'          => '#8B5CF6',
                        'color_secundario'        => '#EDE9FE',
                        'fuente'                  => 'Poppins',
                        'mostrar_ranking'         => true,
                        'mostrar_contador_boletas' => false,
                    ],
                ]),
                'created_by' => 1,
                'created_at' => '2024-08-15 10:00:00',
                'updated_at' => '2024-12-01 08:00:00',
            ],
        ];

        DB::table('campanias')->insert($campanias);
    }
}