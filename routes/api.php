<?php

use App\Http\Controllers\Api\Portal\BoletaController;
use App\Http\Controllers\Api\Portal\ClienteAuthController;
use App\Http\Controllers\Api\Portal\NotificacionController;
use App\Http\Middleware\DetectarSesionSospechosa;
use App\Http\Middleware\EnsureIsCliente;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/portal')->group(function () {

    Route::post('/register',              [ClienteAuthController::class, 'register']);
    Route::post('/login',                 [ClienteAuthController::class, 'login']);
    Route::get('/verify-email/{token}',   [ClienteAuthController::class, 'verificarEmail']);
    Route::post('/reenviar-verificacion', [ClienteAuthController::class, 'reenviarVerificacion']);

    Route::middleware([
        'auth:sanctum',
        EnsureIsCliente::class,
        DetectarSesionSospechosa::class,
    ])->group(function () {

        Route::get('/me',       [ClienteAuthController::class, 'me']);
        Route::post('/logout',  [ClienteAuthController::class, 'logout']);

        Route::prefix('boletas')->name('portal.boletas.')->group(function () {
            Route::get('/resumen',    [BoletaController::class, 'resumen'])->name('resumen');
            Route::get('/',           [BoletaController::class, 'index'])->name('index');
            Route::post('/',          [BoletaController::class, 'store'])->name('store');
            Route::get('/{boleta}',   [BoletaController::class, 'show'])->name('show');
        });

        Route::prefix('notificaciones')->name('portal.notificaciones.')->group(function () {
            Route::get('/',                          [NotificacionController::class, 'index'])->name('index');
            Route::get('/contador-no-leidas',        [NotificacionController::class, 'contadorNoLeidas'])->name('contador');
            Route::get('/{id}',                      [NotificacionController::class, 'show'])->name('show');
            Route::patch('/{id}/marcar-leida',       [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
        });
    });
});
