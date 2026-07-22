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
        public readonly string $tipo, // 'veterinarios' o 'clientes' — viene directo de la ruta
    ) {}

    public function handle(BrevoService $brevo): void
    {
        Log::info('EnviarEmailRegistro job', [
            'cliente_id' => $this->cliente->id,
            'tipo'       => $this->tipo,
        ]);

        $config = config("services.registro_tipos.{$this->tipo}")
            ?? config('services.registro_tipos.clientes'); // fallback por si acaso

        $brevo->enviar(
            destinatario: $this->cliente->email,
            asunto:       '¡Registro exitoso! Bienvenido',
            cuerpo:       view($config['vista_prefix'] . '.registro', [
                'cliente'     => $this->cliente,
                'frontendUrl' => $config['frontend_url'],
            ])->render(),
            tipo:         'registro_cliente',
            clienteId:    $this->cliente->id,
        );

        $brevo->enviar(
            destinatario: config('services.brevo.from_email'),
            asunto:       'Nuevo registro – ' . $this->cliente->nombre . ' ' . $this->cliente->apellidos,
            cuerpo:       view('emails.admin.nuevo-registro', [
                'cliente'  => $this->cliente,
                'boletaId' => null,
            ])->render(),
            tipo:         'registro_admin',
            clienteId:    $this->cliente->id,
        );
    }
}
