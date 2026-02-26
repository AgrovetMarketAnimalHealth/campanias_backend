<?php

use App\Http\Controllers\Api\Panel\BoletaController;
use App\Http\Controllers\Api\Panel\ClienteAdminController;
use App\Http\Controllers\Web\Panel\ClienteWebController;
use App\Http\Controllers\Web\Panel\NotificacionWebController;
use App\Http\Controllers\Web\Panel\RolesWebController;
use App\Http\Controllers\Web\Panel\UsuarioWebController;
use App\Http\Controllers\Web\Panel\BoletaWebController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ── Vistas Web (Inertia) ─────────────────────────────────────────────────
    Route::prefix('panel')->group(function () {
        Route::get('/boletas',        [BoletaWebController::class,       'index'])->name('boletas.index');
        Route::get('/clientes',       [ClienteWebController::class,      'index'])->name('clientes.index');
        Route::get('/clientes/{id}',  [ClienteWebController::class,      'show'])->name('clientes.show');   // ← nueva
        Route::get('/notificaciones', [NotificacionWebController::class, 'index'])->name('notificaciones.index');
        Route::get('/roles',          [RolesWebController::class,        'index'])->name('roles.index');
        Route::get('/usuarios',       [UsuarioWebController::class,      'index'])->name('usuarios.index');
    });

    // ── API Boletas ──────────────────────────────────────────────────────────
    Route::prefix('boleta')->controller(BoletaController::class)->group(function () {
        Route::get('/',         'index')->name('panel.boleta.index');
        Route::get('{boleta}',  'show')->name('panel.boleta.show');
        Route::put('{boleta}',  'update')->name('panel.boleta.update');
    });

    // ── API Clientes ─────────────────────────────────────────────────────────
    Route::prefix('cliente')->controller(ClienteAdminController::class)->group(function () {
        Route::get('/',              'index')->name('panel.cliente.index');
        Route::get('{id}/boletas',   'boletas')->name('panel.cliente.boletas');
    });

});

require __DIR__.'/settings.php';