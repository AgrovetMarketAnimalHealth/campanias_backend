<?php

namespace App\Console\Commands;

use App\Models\Cliente;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MoveDniToCe extends Command
{
    /**
     * Nombre y firma del comando.
     * --dry-run: solo muestra qué se movería, sin guardar cambios.
     */
    protected $signature = 'clientes:mover-dni-a-ce {--dry-run : Solo muestra los cambios sin guardarlos}';

    protected $description = 'Mueve los valores de la columna dni con más de 8 caracteres hacia la columna ce';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Traemos solo los que tienen dni con más de 8 caracteres
        $clientes = Cliente::whereNotNull('dni')
            ->whereRaw('LENGTH(dni) > 8')
            ->get();

        if ($clientes->isEmpty()) {
            $this->info('No se encontraron registros con dni mayor a 8 caracteres.');
            return self::SUCCESS;
        }

        $this->info("Se encontraron {$clientes->count()} registros a procesar.");

        $tabla = [];
        $procesados = 0;

        DB::beginTransaction();

        try {
            foreach ($clientes as $cliente) {
                $dniOriginal = $cliente->dni;

                $tabla[] = [
                    'id'      => $cliente->id,
                    'dni_ant' => $dniOriginal,
                    'ce_ant'  => $cliente->ce,
                ];

                if (!$dryRun) {
                    $cliente->ce = $dniOriginal;
                    $cliente->dni = null; // o '' si prefieres string vacío en vez de null
                    $cliente->save();
                }

                $procesados++;
            }

            if ($dryRun) {
                DB::rollBack();
                $this->warn('DRY RUN: no se guardó ningún cambio.');
            } else {
                DB::commit();
                $this->info('Cambios guardados correctamente.');
            }

            $this->table(['ID', 'DNI anterior', 'CE anterior'], $tabla);
            $this->info("Total procesados: {$procesados}");

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Ocurrió un error, se revirtió todo: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}