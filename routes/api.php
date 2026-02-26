<?php

use App\Http\Controllers\Api\Portal\BoletaController;
use App\Http\Controllers\Api\Portal\ClienteAuthController;
use App\Http\Controllers\Api\Portal\NotificacionController; // <-- Importar el controlador
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // Públicas (sin token)
    Route::post('/portal/register',              [ClienteAuthController::class, 'register']);
    Route::post('/portal/login',                 [ClienteAuthController::class, 'login']);
    Route::get('/portal/verify-email/{token}',   [ClienteAuthController::class, 'verificarEmail']);
    Route::post('/portal/reenviar-verificacion', [ClienteAuthController::class, 'reenviarVerificacion']);

    // Requiere token
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/portal/me',      [ClienteAuthController::class, 'me']);
        Route::post('/portal/logout', [ClienteAuthController::class, 'logout']);

        // Boletas
        Route::get('/portal/boletas/resumen',  [BoletaController::class, 'resumen']);
        Route::get('/portal/boletas',          [BoletaController::class, 'index']);
        Route::post('/portal/boletas',         [BoletaController::class, 'store']);
        Route::get('/portal/boletas/{boleta}', [BoletaController::class, 'show']);
        
        // Notificaciones - Organizadas por funcionalidad
        Route::prefix('portal/notificaciones')->name('portal.notificaciones.')->group(function () {
            Route::get('/', [NotificacionController::class, 'index'])->name('index');
            Route::get('/contador-no-leidas', [NotificacionController::class, 'contadorNoLeidas'])->name('contador');
            Route::get('/{id}', [NotificacionController::class, 'show'])->name('show');
            Route::patch('/{id}/marcar-leida', [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
        });
    });
});