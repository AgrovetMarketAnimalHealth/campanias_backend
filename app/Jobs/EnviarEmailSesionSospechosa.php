<?php

namespace App\Jobs;

use App\Models\Cliente;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarEmailSesionSospechosa implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly Cliente $cliente,
        public readonly array   $metadata,
    ) {}

    public function handle(BrevoService $brevo): void
    {
        Log::info('EnviarEmailSesionSospechosa job', [
            'cliente_id' => $this->cliente->id,
            'ip'         => $this->metadata['ip'],
            'motivo'     => $this->metadata['motivo'],
        ]);

        $brevo->enviar(
            destinatario: $this->cliente->email,
            asunto:       '⚠️ Acceso inusual detectado en tu cuenta',
            cuerpo:       view('emails.sesion-sospechosa', [
                            'cliente'  => $this->cliente,
                            'metadata' => $this->metadata,
                        ])->render(),
            tipo:         'sesion_sospechosa',
            clienteId:    $this->cliente->id,
        );
    }
}