<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\Panel\ReportesClientesController;
use Illuminate\Console\Command;

class EnviarReporteDiarioInscritos extends Command
{
    protected $signature = 'reportes:inscritos-diario
                            {--email= : Email de destino (usa REPORTE_INSCRITOS_EMAIL del .env por defecto)}';

    protected $description = 'Genera y envía el reporte diario de inscritos por email con Excel adjunto';

    public function handle(ReportesClientesController $controller): int
    {
        $email = $this->option('email') ?? config('reportes.inscritos_email');

        if (! $email) {
            $this->error('No se definió email de destino. Usa --email=xxx o configura REPORTE_INSCRITOS_EMAIL en .env');
            return Command::FAILURE;
        }

        $this->info("📊 Generando reporte diario de inscritos para: {$email}");

        try {
            $controller->despacharReporteDiario($email);
            $this->info('✅ Reporte enviado correctamente.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('❌ Error al enviar el reporte: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}