<?php
namespace App\Jobs;
use App\Models\Cliente;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
class EnviarEmailRegistro implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly Cliente $cliente,
        public readonly ?string $boletaId = null,
    ) {}

    public function handle(BrevoService $brevo): void
    {
        Log::info('EnviarEmailRegistro job', [
            'cliente_id' => $this->cliente->id,
            'boleta_id'  => $this->boletaId,
        ]);

        $brevo->enviar(
            destinatario: $this->cliente->email,
            asunto:       '¡Registro exitoso! Bienvenido',
            cuerpo:       view('emails.registro', ['cliente' => $this->cliente])->render(),
            tipo:         'registro_cliente',
            clienteId:    $this->cliente->id,
            boletaId:     $this->boletaId,
        );
    }
}