<?php

namespace App\Jobs;

use App\Models\Boleta;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarEmailBoletaAceptada implements ShouldQueue
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

        $brevo->enviar(
            destinatario: $this->boleta->cliente->email,
            asunto: '¡Tu boleta fue aceptada!',
            cuerpo: view('emails.boleta_aceptada', ['boleta' => $this->boleta])->render(),
            tipo: 'boleta_aceptada',
            clienteId: $this->boleta->cliente_id,
            boletaId: $this->boleta->id,
        );
    }
}