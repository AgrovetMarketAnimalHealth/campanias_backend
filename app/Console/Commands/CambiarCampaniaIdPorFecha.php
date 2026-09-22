<?php

namespace App\Console\Commands;

use App\Models\ClienteCampania;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CambiarCampaniaIdPorFecha extends Command
{
    /**
     * Nombre y firma del comando.
     * --dry-run: solo muestra qué se actualizaría, sin guardar cambios.
     */
    protected $signature = 'cliente-campania:cambiar-id
                            {--dry-run : Solo muestra los cambios sin guardarlos}';

    protected $description = 'Cambia el campania_id de registros cliente_campania según campania_id anterior y fecha de creación exacta';

    // Valores fijos según lo solicitado
    private string $campaniaIdAnterior = '019e4737-58d7-7175-a0b7-de4c2874da6b';
    private string $campaniaIdNueva    = '01a01fe1-acef-712d-b513-8aa6c0b33eb8';
    private string $fechaCreacion      = '2026-08-10 19:34:02';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $registros = ClienteCampania::where('campania_id', $this->campaniaIdAnterior)
            ->where('created_at', $this->fechaCreacion)
            ->get();

        if ($registros->isEmpty()) {
            $this->warn('No se encontraron registros con esa campania_id y fecha de creación exactas.');
            return self::SUCCESS;
        }

        $this->info("Se encontraron {$registros->count()} registros a actualizar.");
        $this->info("De campania_id: {$this->campaniaIdAnterior}");
        $this->info("A campania_id:  {$this->campaniaIdNueva}");
        $this->info("Filtrado por created_at: {$this->fechaCreacion}");

        $tabla = [];
        $procesados = 0;

        DB::beginTransaction();

        try {
            foreach ($registros as $registro) {
                $tabla[] = [
                    'id'          => $registro->id,
                    'cliente_id'  => $registro->cliente_id,
                    'campania_id_ant' => $registro->campania_id,
                    'created_at'  => $registro->created_at,
                ];

                if (!$dryRun) {
                    $registro->campania_id = $this->campaniaIdNueva;
                    $registro->save();
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

            $this->table(['ID', 'Cliente ID', 'campania_id anterior', 'created_at'], $tabla);
            $this->info("Total procesados: {$procesados}");

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Ocurrió un error, se revirtió todo: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}