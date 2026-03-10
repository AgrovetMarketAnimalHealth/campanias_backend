<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SeedMasivoDatos extends Command
{
    protected $signature = 'seed:masivo
                        {--clientes=10       : Total de clientes a crear}
                        {--boletas=10        : Total de boletas a crear}
                        {--puntos=10         : Total de puntos a crear}
                        {--notificaciones=10 : Total de notificaciones a crear}
                        {--chunk=500         : Tamaño del lote para inserts}
                        {--fresh              : Truncar tablas antes de insertar}';

    protected $description = 'Genera 100k+ registros por tabla para pruebas de rendimiento';

    private array $departamentos    = ['Lima','Arequipa','Cusco','La Libertad','Piura','Junín','Puno','Cajamarca','Lambayeque','Áncash'];
    private array $estadosBoleta    = ['pendiente','aceptada','rechazada'];
    private array $estadosCliente   = ['pendiente','activo','rechazado'];
    private array $estadosEnvio     = ['enviado','fallido','pendiente'];
    private array $tiposNotificacion = ['registro_cliente','boleta_recibida','boleta_aceptada','boleta_rechazada','puntos_acreditados','bienvenida'];

    public function handle(): int
    {
        $totalClientes = (int) $this->option('clientes');
        $totalBoletas  = (int) $this->option('boletas');
        $totalPuntos   = (int) $this->option('puntos');
        $totalNotis    = (int) $this->option('notificaciones');
        $chunk         = (int) $this->option('chunk');
        $fresh         = (bool) $this->option('fresh');

        $this->mostrarResumen($totalClientes, $totalBoletas, $totalPuntos, $totalNotis);

        if ($fresh) {
            if (! $this->confirm('¿Truncar todas las tablas? Esto borrará todos los datos existentes.')) {
                $this->warn('Cancelado.');
                return self::FAILURE;
            }
            $this->truncarTablas();
        }

        $inicio = microtime(true);

        // ── 1. CLIENTES ───────────────────────────────────────────────────────
        // id | tipo_persona | nombre | apellidos | dni | ruc | departamento
        // email | telefono | acepta_politicas | acepta_terminos
        // archivo_comprobante | estado | email_verified_at | ...2FA | timestamps
        // ─────────────────────────────────────────────────────────────────────
        $this->info("\n👤 Insertando {$totalClientes} clientes...");
        $bar = $this->output->createProgressBar($totalClientes);
        $bar->start();

        $tmpClientes = tempnam(sys_get_temp_dir(), 'cli_');
        $fhC = fopen($tmpClientes, 'w');

        foreach (array_chunk(range(1, $totalClientes), $chunk) as $lote) {
            $rows = [];
            foreach ($lote as $i) {
                $esJuridica = ($i % 5 === 0);
                $uuid = (string) Str::uuid();
                fwrite($fhC, $uuid . "\n");
                $now = now()->toDateTimeString();

                $rows[] = [
                    'id'               => $uuid,
                    'tipo_persona'     => $esJuridica ? 'juridica' : 'natural',
                    'nombre'           => $this->nombre(),
                    'apellidos'        => $this->apellidos(),
                    // dni y ruc son columnas separadas con unique — usamos $i para garantizar unicidad
                    'dni'              => $esJuridica ? null : str_pad((string)(10000000 + $i), 8, '0', STR_PAD_LEFT),
                    'ruc'              => $esJuridica ? '20' . str_pad((string)(100000000 + $i), 9, '0', STR_PAD_LEFT) : null,
                    'departamento'     => $this->departamentos[array_rand($this->departamentos)],
                    'email'            => 'u' . $i . '@seed.test',
                    'telefono'         => '9' . str_pad((string)(10000000 + $i), 8, '0', STR_PAD_LEFT),
                    'acepta_politicas' => 1,
                    'acepta_terminos'  => 1,
                    'estado'           => $this->estadosCliente[array_rand($this->estadosCliente)],
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];
            }
            DB::table('clientes')->insert($rows);
            $bar->advance(count($lote));
            unset($rows);
        }

        fclose($fhC);
        $bar->finish();
        $this->line('');

        $clienteIds = file($tmpClientes, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        unlink($tmpClientes);

        // ── 2. BOLETAS ────────────────────────────────────────────────────────
        // id | cliente_id | codigo (unique) | archivo (NOT NULL) | puntos_otorgados
        // numero_boleta | monto | estado | observacion | timestamps
        // ─────────────────────────────────────────────────────────────────────
        $this->info("🧾 Insertando {$totalBoletas} boletas...");
        $bar = $this->output->createProgressBar($totalBoletas);
        $bar->start();

        $tmpBoletas = tempnam(sys_get_temp_dir(), 'bol_');
        $fhB = fopen($tmpBoletas, 'w');

        foreach (array_chunk(range(1, $totalBoletas), $chunk) as $lote) {
            $rows = [];
            foreach ($lote as $i) {
                $uuid      = (string) Str::uuid();
                $clienteId = $clienteIds[array_rand($clienteIds)];
                fwrite($fhB, $uuid . ',' . $clienteId . "\n");
                $now = now()->toDateTimeString();

                $rows[] = [
                    'id'               => $uuid,
                    'cliente_id'       => $clienteId,
                    'codigo'           => 'BOL-' . date('Y') . '-' . str_pad((string)$i, 6, '0', STR_PAD_LEFT),
                    'archivo'          => 'boletas/seed/boleta_' . $i . '.pdf',
                    'numero_boleta'    => 'F' . rand(100, 999) . '-' . str_pad((string)$i, 8, '0', STR_PAD_LEFT),
                    'monto'            => round(rand(5000, 500000) / 100, 2),
                    'puntos_otorgados' => rand(1, 100),
                    'estado'           => $this->estadosBoleta[array_rand($this->estadosBoleta)],
                    'observacion'      => $i % 7 === 0 ? 'Observación de prueba #' . $i : null,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];
            }
            DB::table('boletas')->insert($rows);
            $bar->advance(count($lote));
            unset($rows);
        }

        fclose($fhB);
        $bar->finish();
        $this->line('');

        $boletaPares = file($tmpBoletas, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        unlink($tmpBoletas);

        // ── 3. PUNTOS ─────────────────────────────────────────────────────────
        // id | cliente_id | boleta_id | puntos (integer) | descripcion | timestamps
        // ─────────────────────────────────────────────────────────────────────
        $this->info("⭐ Insertando {$totalPuntos} puntos...");
        $bar = $this->output->createProgressBar($totalPuntos);
        $bar->start();

        foreach (array_chunk(range(1, $totalPuntos), $chunk) as $lote) {
            $rows = [];
            foreach ($lote as $_) {
                $par = explode(',', $boletaPares[array_rand($boletaPares)]);
                $now = now()->toDateTimeString();
                $rows[] = [
                    'id'          => (string) Str::uuid(),
                    'cliente_id'  => $par[1],
                    'boleta_id'   => $par[0],
                    'puntos'      => rand(1, 50),
                    'descripcion' => rand(0, 1) ? 'Puntos por boleta acreditada' : null,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }
            DB::table('puntos')->insert($rows);
            $bar->advance(count($lote));
            unset($rows);
        }

        $bar->finish();
        $this->line('');

        // ── 4. NOTIFICACIONES ─────────────────────────────────────────────────
        // id | cliente_id (nullable) | user_id (nullable) | boleta_id (nullable)
        // tipo (enum) | destinatario_email | asunto | cuerpo | brevo_message_id
        // estado_envio | leido_at | respuesta_brevo | enviado_at | intentos | timestamps
        // ─────────────────────────────────────────────────────────────────────
        $this->info("🔔 Insertando {$totalNotis} notificaciones...");
        $bar = $this->output->createProgressBar($totalNotis);
        $bar->start();

        foreach (array_chunk(range(1, $totalNotis), $chunk) as $lote) {
            $rows = [];
            foreach ($lote as $i) {
                $par    = explode(',', $boletaPares[array_rand($boletaPares)]);
                $estado = $this->estadosEnvio[array_rand($this->estadosEnvio)];
                $now    = now()->toDateTimeString();

                $rows[] = [
                    'id'                 => (string) Str::uuid(),
                    'cliente_id'         => $par[1],
                    'boleta_id'          => $par[0],
                    'user_id'            => null,
                    'tipo'               => $this->tiposNotificacion[array_rand($this->tiposNotificacion)],
                    'destinatario_email' => 'n' . $i . '@seed.test',
                    'asunto'             => 'Notificación de prueba #' . $i,
                    'cuerpo'             => 'Cuerpo de la notificación número ' . $i . ' generada para pruebas de carga.',
                    'brevo_message_id'   => $estado === 'enviado' ? (string) Str::uuid() : null,
                    'estado_envio'       => $estado,
                    'enviado_at'         => $estado === 'enviado' ? $now : null,
                    'leido_at'           => $i % 3 === 0 ? $now : null,
                    'intentos'           => rand(1, 5),
                    'respuesta_brevo'    => null,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ];
            }
            DB::table('notificaciones')->insert($rows);
            $bar->advance(count($lote));
            unset($rows);
        }

        $bar->finish();
        $this->line('');

        // ── RESUMEN FINAL ─────────────────────────────────────────────────────
        $segundos = round(microtime(true) - $inicio, 2);
        $minutos  = (int) floor($segundos / 60);
        $segs     = round($segundos - ($minutos * 60), 2);

        $this->table(
            ['Tabla', 'Registros insertados'],
            [
                ['clientes',       number_format($totalClientes)],
                ['boletas',        number_format($totalBoletas)],
                ['puntos',         number_format($totalPuntos)],
                ['notificaciones', number_format($totalNotis)],
                ['TOTAL',          number_format($totalClientes + $totalBoletas + $totalPuntos + $totalNotis)],
            ]
        );
        $this->info("✅ Completado en {$minutos}m {$segs}s");

        return self::SUCCESS;
    }

    private function mostrarResumen(int $c, int $b, int $p, int $n): void
    {
        $this->newLine();
        $this->info('╔══════════════════════════════════════╗');
        $this->info('║    SEED MASIVO — PRUEBA DE CARGA     ║');
        $this->info('╚══════════════════════════════════════╝');
        $this->table(
            ['Tabla', 'Registros a insertar'],
            [
                ['clientes',       number_format($c)],
                ['boletas',        number_format($b)],
                ['puntos',         number_format($p)],
                ['notificaciones', number_format($n)],
                ['TOTAL',          number_format($c + $b + $p + $n)],
            ]
        );
    }

    private function truncarTablas(): void
    {
        $this->warn('🗑  Truncando tablas...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('notificaciones')->truncate();
        DB::table('puntos')->truncate();
        DB::table('boletas')->truncate();
        DB::table('clientes')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        $this->info('✔  Tablas limpias.');
    }

    private function nombre(): string
    {
        static $n = ['Carlos','Ana','Luis','María','Jorge','Rosa','Pedro','Elena',
                     'Miguel','Lucía','José','Carmen','Andrés','Patricia','Diego',
                     'Sofía','Ricardo','Valeria','Fernando','Gabriela'];
        return $n[array_rand($n)];
    }

    private function apellidos(): string
    {
        static $a = ['García','López','Martínez','Pérez','Rodríguez','González',
                     'Sánchez','Ramírez','Torres','Flores','Cruz','Reyes','Morales',
                     'Herrera','Castillo','Vargas','Mendoza','Quispe','Huanca'];
        return $a[array_rand($a)] . ' ' . $a[array_rand($a)];
    }
}