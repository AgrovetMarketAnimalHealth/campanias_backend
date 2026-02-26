<?php
namespace App\Services;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.brevo.com/v3';
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->apiKey    = config('services.brevo.key');
        $this->fromEmail = config('services.brevo.from_email');
        $this->fromName  = config('services.brevo.from_name');
    }

    public function enviar(
        string  $destinatario,
        string  $asunto,
        string  $cuerpo,
        string  $tipo,
        ?string $clienteId = null,
        ?string $boletaId  = null,
    ): void {
        $notificacion = Notificacion::create([
            'cliente_id'         => $clienteId,
            'boleta_id'          => $boletaId,
            'user_id'            => Auth::id(),
            'tipo'               => $tipo,
            'destinatario_email' => $destinatario,
            'asunto'             => $asunto,
            'cuerpo'             => $cuerpo,
            'estado_envio'       => 'pendiente',
            'intentos'           => 0,
            'created_by'         => Auth::id(),
        ]);

        try {
            $response = Http::withHeaders([
                'api-key'      => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/smtp/email", [
                'sender' => [
                    'email' => $this->fromEmail,
                    'name'  => $this->fromName,
                ],
                'to'          => [['email' => $destinatario]],
                'subject'     => $asunto,
                'htmlContent' => $cuerpo,
            ]);

            $notificacion->update([
                'estado_envio'     => $response->successful() ? 'enviado' : 'fallido',
                'brevo_message_id' => $response->json('messageId'),
                'respuesta_brevo'  => $response->body(),
                'enviado_at'       => now(),
                'intentos'         => 1,
                'updated_by'       => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Brevo error: ' . $e->getMessage());

            $notificacion->update([
                'estado_envio'    => 'fallido',
                'respuesta_brevo' => $e->getMessage(),
                'intentos'        => 1,
                'updated_by'      => Auth::id(),
            ]);
        }
    }
}