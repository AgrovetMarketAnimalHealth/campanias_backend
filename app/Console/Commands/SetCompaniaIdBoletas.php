<?php

namespace App\Console\Commands;

use App\Models\Boleta;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetCompaniaIdBoletas extends Command
{
    /**
     * Nombre y firma del comando.
     * --dry-run: solo muestra qué se actualizaría, sin guardar cambios.
     */
    protected $signature = 'boletas:asignar-compania-id {--dry-run : Solo muestra los cambios sin guardarlos}';

    protected $description = 'Asigna un compania_id fijo a todas las boletas donde compania_id es null';

    // ID fijo a asignar
    private string $companiaId = '01a01fe1-acef-712d-b513-8aa6c0b33eb8';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $boletas = Boleta::whereNull('compania_id')->get();

        if ($boletas->isEmpty()) {
            $this->info('No se encontraron boletas con compania_id null.');
            return self::SUCCESS;
        }

        $this->info("Se encontraron {$boletas->count()} boletas a actualizar.");
        $this->info("Se asignará el compania_id: {$this->companiaId}");

        $tabla = [];
        $procesados = 0;

        DB::beginTransaction();

        try {
            foreach ($boletas as $boleta) {
                $tabla[] = [
                    'id'              => $boleta->id,
                    'codigo'          => $boleta->codigo,
                    'compania_id_ant' => $boleta->compania_id ?? 'NULL',
                ];

                if (!$dryRun) {
                    $boleta->compania_id = $this->companiaId;
                    $boleta->save();
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

            $this->table(['ID', 'Código', 'compania_id anterior'], $tabla);
            $this->info("Total procesados: {$procesados}");

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Ocurrió un error, se revirtió todo: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}