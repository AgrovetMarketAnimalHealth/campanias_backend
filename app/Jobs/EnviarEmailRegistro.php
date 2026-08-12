<?php

namespace App\Jobs;

use App\Models\Campania;
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
        public readonly Campania $campania,
    ) {}

    public function handle(BrevoService $brevo): void
    {
        // La campaña seleccionada determina la URL y el tipo
        $partes = explode('/', trim($this->campania->url, '/'));

        $tipo = $partes[1] ?? 'clientes';

        Log::info('EnviarEmailRegistro job', [
            'cliente_id'  => $this->cliente->id,
            'campania_id' => $this->campania->id,
            'campania_url' => $this->campania->url,
            'tipo'         => $tipo,
        ]);

        $config = config("services.registro_tipos.{$tipo}")
            ?? config('services.registro_tipos.clientes');

        // ── Email al cliente ─────────────────────────────────────
        $brevo->enviar(
            destinatario: $this->cliente->email,
            asunto: '¡Registro exitoso! Bienvenido',
            cuerpo: view($config['vista_prefix'] . '.registro', [
                'cliente'     => $this->cliente,
                'campania'    => $this->campania,
                'frontendUrl' => $this->campania->url,
            ])->render(),
            tipo: 'registro_cliente',
            clienteId: $this->cliente->id,
        );

        // ── Notificación interna ─────────────────────────────────
        $brevo->enviar(
            destinatario: config('services.brevo.from_email'),
            asunto: 'Nuevo registro – ' .
                $this->cliente->nombre . ' ' .
                $this->cliente->apellidos,
            cuerpo: view('emails.admin.nuevo-registro', [
                'cliente'  => $this->cliente,
                'boletaId' => null,
                'campania' => $this->campania,
            ])->render(),
            tipo: 'registro_admin',
            clienteId: $this->cliente->id,
        );
    }
}