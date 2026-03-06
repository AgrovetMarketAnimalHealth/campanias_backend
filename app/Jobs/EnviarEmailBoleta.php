<?php
namespace App\Jobs;

use App\Models\Boleta;
use App\Models\Cliente;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarEmailBoleta implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly Cliente $cliente,
        public readonly Boleta  $boleta,
        public readonly ?int    $userId = null,
    ) {}

    public function handle(BrevoService $brevo): void{
        // ── Email al cliente ──────────────────────────────────────────
        $brevo->enviar(
            destinatario: $this->cliente->email,
            asunto:       '¡Recibimos tu comprobante!',
            cuerpo:       view('emails.boleta-recibida', [
                            'cliente' => $this->cliente,
                            'boleta'  => $this->boleta,
                        ])->render(),
            tipo:      'boleta_recibida',
            clienteId: $this->cliente->id,
            boletaId:  $this->boleta->id,
            userId:    $this->userId,
        );

        // ── Notificación interna al admin ─────────────────────────────
        $brevo->enviar(
            destinatario: config('services.brevo.from_email'),
            asunto:       '📎 Nuevo comprobante recibido – ' . $this->cliente->nombre . ' ' . $this->cliente->apellidos,
            cuerpo:       view('emails.admin.nuevo-comprobante', [
                            'cliente' => $this->cliente,
                            'boleta'  => $this->boleta,
                        ])->render(),
            tipo:      'registro_admin',
            clienteId: $this->cliente->id,
            boletaId:  $this->boleta->id,
            userId:    $this->userId,
        );
    }
}