<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\Registro\StoreClienteRequest;
use App\Jobs\EnviarEmailRegistro;
use App\Models\Boleta;
use App\Models\Cliente;
use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ClienteAuthController extends Controller
{
    // ─────────────────────────────────────────
    // REGISTRO
    // ─────────────────────────────────────────
    public function register(StoreClienteRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // 1. Registrar cliente
            $cliente = Cliente::create([
                'tipo_persona'                  => $request->tipo_persona,
                'nombre'                        => $request->nombre,
                'apellidos'                     => $request->apellidos,
                'dni'                           => $request->dni,
                'ruc'                           => $request->ruc,
                'departamento'                  => $request->departamento,
                'email'                         => $request->email,
                'password'                      => $request->password,
                'telefono'                      => $request->telefono,
                'acepta_politicas'              => true,
                'acepta_terminos'               => true,
                'estado'                        => 'pendiente',
                'email_verification_token'      => Str::random(64),
                'email_verification_expires_at' => now()->addHours(24),
            ]);

            // 2. Guardar imagen en MinIO
            $rutaComprobante = Storage::disk('s3')->putFile(
                "clientes/{$cliente->id}/comprobantes",
                $request->file('archivo_comprobante')
            );

            // 3. Crear boleta
            $boleta = Boleta::create([
                'cliente_id' => $cliente->id,
                'archivo'    => $rutaComprobante,
                'estado'     => 'pendiente',
            ]);

            DB::commit();

            // 4. Despachar job después del commit
            EnviarEmailRegistro::dispatch($cliente, (string) $boleta->id)->onQueue('emails');
            return response()->json([
                'success' => true,
                'accion'  => 'verificar_email',
                'message' => 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            if (isset($cliente)) {
                Storage::disk('s3')->deleteDirectory("clientes/{$cliente->id}");
            }
            Log::error('Error en registro de cliente', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'ip'    => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar. Intenta nuevamente.',
            ], 500);
        }
    }
    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────
    public function login(Request $request): JsonResponse{
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);
        $key = 'login:' . Str::lower($request->email) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $segundos = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Demasiados intentos fallidos. Espera {$segundos} segundos.",
            ], 429);
        }
        if (!Auth::guard('cliente')->attempt($request->only('email', 'password'))) {
            RateLimiter::hit($key, 60);
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }
        RateLimiter::clear($key);
        $cliente = Auth::guard('cliente')->user();

        if (!$cliente->email_verified_at) {
            Auth::guard('cliente')->logout();
            return response()->json([
                'success' => false,
                'accion'  => 'verificar_email',
                'message' => 'Debes verificar tu correo electrónico antes de ingresar.',
            ], 403);
        }
        $cliente->tokens()->delete();
        $token = $cliente->createToken('cliente-token')->plainTextToken;
        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'cliente' => [
                'id'     => $cliente->id,
                'nombre' => $cliente->nombre,
                'email'  => $cliente->email,
            ],
        ])->cookie(
            'auth_token',
            $token,
            60 * 8,
            '/',
            null,
            config('app.env') === 'production', // secure
            false,  // httpOnly
            false,
            'Lax'
        );
    }

    // ─────────────────────────────────────────
    // VERIFICAR EMAIL
    // ─────────────────────────────────────────
    public function verificarEmail(string $token): JsonResponse
    {
        $cliente = Cliente::where('email_verification_token', $token)
            ->whereNull('email_verified_at')
            ->where('email_verification_expires_at', '>', now())
            ->first();

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'El enlace es inválido, ya fue usado, o expiró.',
            ], 422);
        }

        $cliente->update([
            'email_verified_at'             => now(),
            'email_verification_token'      => null,
            'email_verification_expires_at' => null,
            'estado'                        => 'activo',
        ]);

        // ✅ FIX 4: Revocar tokens previos antes de emitir uno nuevo
        $cliente->tokens()->delete();

        $authToken = $cliente->createToken('cliente-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => '¡Correo verificado! Bienvenido.',
            'cliente' => [
                'id'     => $cliente->id,
                'nombre' => $cliente->nombre,
                'email'  => $cliente->email,
            ],
        ])->cookie(
            'auth_token',
            $authToken,
            60 * 8,
            '/',
            null,
            config('app.env') === 'production', // secure
            true,
            false,
            'Lax'
        );
    }

    // ─────────────────────────────────────────
    // REENVIAR VERIFICACIÓN
    // ─────────────────────────────────────────
    public function reenviarVerificacion(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $cliente = Cliente::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();

        // Respuesta idéntica si el correo existe o no (evita user enumeration)
        if (!$cliente) {
            return response()->json([
                'success' => true,
                'message' => 'Si el correo existe y no está verificado, recibirás un enlace.',
            ]);
        }

        $key = 'reenviar-verificacion:' . $cliente->id;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $segundos = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Demasiados intentos. Espera {$segundos} segundos.",
            ], 429);
        }

        RateLimiter::hit($key, 600);

        // Query directa para no tocar otros campos
        DB::table('clientes')
            ->where('id', $cliente->id)
            ->update([
                'email_verification_token'      => Str::random(64),
                'email_verification_expires_at' => now()->addHours(24),
            ]);

        // Recargar el modelo para que el job tenga el token actualizado
        $cliente->refresh();

        EnviarEmailRegistro::dispatch($cliente)->onQueue('emails');

        Notificacion::create([
            'cliente_id'         => $cliente->id,
            'tipo'               => 'reenvio_verificacion',
            'destinatario_email' => $cliente->email,
            'asunto'             => 'Reenvío de correo de verificación',
            'cuerpo'             => 'Se reenvió el correo de verificación de cuenta.',
            'estado_envio'       => 'pendiente',
            'intentos'           => RateLimiter::attempts($key),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Si el correo existe y no está verificado, recibirás un enlace.',
        ]);
    }

    // ─────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────
    public function logout(Request $request): JsonResponse{
        $cliente = Auth::guard('sanctum')->user();
        if ($cliente) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada.',
        ])->cookie(Cookie::forget('auth_token'));
    }

    // ─────────────────────────────────────────
    // ME (usuario autenticado)
    // ─────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {   
        $cliente = Auth::guard('sanctum')->user();

        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autenticado.'], 401);
        }

        return response()->json([
            'success' => true,
            'cliente' => [
                'id'           => $cliente->id,
                'nombre'       => $cliente->nombre,
                'apellidos'    => $cliente->apellidos,
                'email'        => $cliente->email,
                'telefono'     => $cliente->telefono,
                'tipo_persona' => $cliente->tipo_persona,
                'estado'       => $cliente->estado,
            ],
        ]);
    }
}