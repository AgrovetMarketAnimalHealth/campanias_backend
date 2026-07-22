<?php

namespace App\Jobs;

use App\Models\Boleta;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarEmailBoletaRechazada implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly Boleta $boleta,
    ) {}

    public function handle(BrevoService $brevo): void
    {
        $this->boleta->load('cliente');

        $tipo = $this->boleta->cliente->tipo_registro;

        $config = config("services.registro_tipos.{$tipo}")
            ?? config('services.registro_tipos.clientes'); // fallback

        $brevo->enviar(
            destinatario: $this->boleta->cliente->email,
            asunto:       'Tu boleta fue rechazada',
            cuerpo:       view($config['vista_prefix'] . '.boleta_rechazada', [
                'boleta' => $this->boleta,
            ])->render(),
            tipo:         'boleta_rechazada',
            clienteId:    $this->boleta->cliente_id,
            boletaId:     $this->boleta->id,
        );
    }
}