<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\BrevoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarEmailBienvenidaUser implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly User $user,
    ) {}

    public function handle(BrevoService $brevo): void
    {
        $brevo->enviar(
            destinatario: $this->user->email,
            asunto: '¡Bienvenido al sistema!',
            cuerpo: view('emails.users.bienvenida', ['user' => $this->user])->render(),
            tipo: 'bienvenida',
            userId: $this->user->id,
        );
    }
}
