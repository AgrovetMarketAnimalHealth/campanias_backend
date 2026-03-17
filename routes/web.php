<?php

use App\Http\Controllers\Api\Panel\BoletaController;
use App\Http\Controllers\Api\Panel\ClienteAdminController;
use App\Http\Controllers\Api\Panel\ClientePuntoController;
use App\Http\Controllers\Api\Panel\NotificacionesController;
use App\Http\Controllers\Api\Panel\ReporteBoletasController;
use App\Http\Controllers\Api\Panel\ReportesClientesController;
use App\Http\Controllers\Api\Panel\RolesController;
use App\Http\Controllers\Api\Panel\UsuarioController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Web\Panel\ClienteWebController;
use App\Http\Controllers\Web\Panel\NotificacionWebController;
use App\Http\Controllers\Web\Panel\RolesWebController;
use App\Http\Controllers\Web\Panel\UsuarioWebController;
use App\Http\Controllers\Web\Panel\BoletaWebController;
use App\Http\Controllers\Web\Panel\ReportesWebController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('promo-concierto/backoffice')->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    #Ruta para cambiar password (sin password.reset para evitar loop)
    Route::middleware(['auth'])->group(function () {
        Route::get('change-password', [PasswordController::class, 'edit'])
            ->name('password.change');
        Route::post('change-password', [PasswordController::class, 'update'])
            ->name('password.change.update');
    });

    // Rutas protegidas con verificación de restablecimiento
    Route::middleware(['auth', 'verified', 'password.reset'])->group(function () {

        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::prefix('panel')->group(function () {
            Route::get('/boletas',        [BoletaWebController::class,       'index'])->name('boletas.index');
            Route::get('/clientes',       [ClienteWebController::class,      'index'])->name('clientes.index');
            Route::get('/clientes/{id}',  [ClienteWebController::class,      'show'])->name('clientes.show');
            Route::get('/notificaciones', [NotificacionWebController::class, 'index'])->name('notificaciones.index');
            Route::get('/roles',          [RolesWebController::class,        'page'])->name('roles.index');
            Route::get('/usuarios',       [UsuarioWebController::class,      'page'])->name('usuarios.index');
            
            #Reportes
            Route::prefix('reportes')->controller(ReportesWebController::class)->group(function () {
                Route::get('/clientes', 'index')->name('reportes.clientes.index');
                Route::get('/boletas',      'indexBoletas')->name('reportes.boletas.index');
                Route::get('/puntos',   'indexpuntos')->name('reportes.puntos.index');
            });
        });

        Route::prefix('boleta')->controller(BoletaController::class)->group(function () {
            Route::get('/',         'index')->name('panel.boleta.index');
            Route::get('{boleta}',  'show')->name('panel.boleta.show');
            Route::put('{boleta}',  'update')->name('panel.boleta.update');
        });

        Route::prefix('cliente')->controller(ClienteAdminController::class)->group(function () {
            Route::get('/',                    'index')   ->name('panel.cliente.index');
            Route::get('{cliente}',            'show')    ->name('panel.cliente.show');
            Route::put('{cliente}',            'update')  ->name('panel.cliente.update');
            Route::get('{cliente}/boletas',    'boletas') ->name('panel.cliente.boletas');
        });

        Route::prefix('notificacion')->controller(NotificacionesController::class)->group(function () {
            Route::get('/',              'index')->name('panel.notificacion.index');
            Route::post('{id}/reenviar', 'reenviar')->name('panel.notificacion.reenviar');
        });

        Route::prefix('punto')->controller(ClientePuntoController::class)->group(function () {
            Route::get('/',                          'index')->name('panel.punto.index');
            Route::post('/exportar-boletos',         'exportarBoletos')->name('panel.punto.exportar');
            Route::get('/estado-boletos/{filename}', 'estadoBoletos')->name('panel.punto.estado');
            Route::get('/descargar/{filename}',      'descargarBoletos')->name('panel.punto.descargar');
        });
        
        Route::prefix('customers')->controller(ReportesClientesController::class)->group(function () {
            Route::get('/metricas', 'metricas')->name('customers.metricas');
            Route::get('/listado', 'listado')->name('customers.listado');
            Route::get('/exportar', 'exportarExcel')->name('customers.exportar');
            Route::post('/enviar-reporte','enviarReporteDiario')->name('customers.enviar');
        });

        Route::prefix('tickets')->controller(ReporteBoletasController::class)->group(function () {
            Route::get('/metricas', 'metricas')->name('tickets.metricas');
            Route::get('/listado', 'listado')->name('tickets.listado');
            Route::get('/exportar', 'exportarExcel')->name('tickets.exportar');
            Route::post('/enviar-reporte','enviarReporte')->name('tickets.enviar');
        });

        Route::prefix('usuario')->group(function () {
            Route::get('/',                    [UsuarioController::class, 'index'])->name('usuario.index');
            Route::post('/',                   [UsuarioController::class, 'store'])->name('usuario.store');
            Route::get('/{user}',              [UsuarioController::class, 'show'])->name('usuario.show');
            Route::put('/{user}',              [UsuarioController::class, 'update'])->name('usuario.update');
            Route::delete('/{user}',           [UsuarioController::class, 'destroy'])->name('usuario.destroy');
            Route::get('/search/by-subranch',  [UsuarioController::class, 'search'])->name('usuario.search');
        });

        Route::prefix('rol')->group(function () {
            Route::get('/',         [RolesController::class, 'index'])->name('rol.index');
            Route::get('/Permisos', [RolesController::class, 'indexPermisos'])->name('rol.indexPermisos');
            Route::post('/',        [RolesController::class, 'store'])->name('rol.store');
            Route::get('/{id}',     [RolesController::class, 'show'])->name('rol.show');
            Route::put('/{id}',     [RolesController::class, 'update'])->name('rol.update');
            Route::delete('/{id}',  [RolesController::class, 'destroy'])->name('rol.destroy');
        });
    });

    require __DIR__.'/settings.php';
});
