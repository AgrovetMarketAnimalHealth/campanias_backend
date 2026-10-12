<?php

use App\Http\Controllers\Api\Panel\ClienteAdminController;
use App\Models\Cliente;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

beforeEach(function () {
    Schema::dropIfExists('puntos');
    Schema::dropIfExists('boletas');
    Schema::dropIfExists('clientes');

    Schema::create('clientes', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('tipo_persona');
        $table->string('nombre');
        $table->string('apellidos')->nullable();
        $table->string('dni')->nullable();
        $table->string('ruc')->nullable();
        $table->string('ce')->nullable();
        $table->string('departamento')->nullable();
        $table->string('email');
        $table->string('estado');
        $table->timestamp('email_verified_at')->nullable();
        $table->boolean('ganador')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('boletas', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('cliente_id');
        $table->string('estado');
        $table->softDeletes();
    });

    Schema::create('puntos', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('cliente_id');
        $table->decimal('puntos', 10, 2);
        $table->softDeletes();
    });
});

afterEach(function () {
    Schema::dropIfExists('puntos');
    Schema::dropIfExists('boletas');
    Schema::dropIfExists('clientes');
});

it('exports all filtered clients across pages with separate ticket statuses', function () {
    $clientIds = [];

    foreach (range(1, 18) as $index) {
        $clientId = (string) Str::uuid();
        $clientIds[] = $clientId;

        DB::table('clientes')->insert([
            'id' => $clientId,
            'tipo_persona' => 'natural',
            'nombre' => 'Cliente Exportable '.$index,
            'apellidos' => 'Prueba',
            'dni' => '12345678',
            'departamento' => 'Lima',
            'email' => "cliente{$index}@example.test",
            'estado' => 'activo',
            'email_verified_at' => '2026-01-01 00:00:00',
            'ganador' => $index === 18,
            'created_at' => now()->addSeconds($index),
            'updated_at' => now(),
        ]);
    }

    DB::table('clientes')->insert([
        'id' => (string) Str::uuid(),
        'tipo_persona' => 'natural',
        'nombre' => 'No incluir',
        'apellidos' => null,
        'dni' => null,
        'departamento' => 'Lima',
        'email' => 'otro@example.test',
        'estado' => 'activo',
        'ganador' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    foreach (['aceptada', 'pendiente', 'rechazada'] as $estado) {
        DB::table('boletas')->insert([
            'id' => (string) Str::uuid(),
            'cliente_id' => $clientIds[17],
            'estado' => $estado,
        ]);
    }

    DB::table('puntos')->insert([
        'id' => (string) Str::uuid(),
        'cliente_id' => $clientIds[17],
        'puntos' => 25,
    ]);

    Gate::shouldReceive('authorize')
        ->once()
        ->with('viewAny', Cliente::class);

    $response = app(ClienteAdminController::class)->exportarExcel(
        Request::create('/promo-concierto/backoffice/cliente/exportar', 'GET', [
            'search' => 'Cliente Exportable',
        ])
    );

    $temporaryFile = tempnam(sys_get_temp_dir(), 'clientes-export-');
    expect($temporaryFile)->not->toBeFalse();

    try {
        $outputBufferLevel = ob_get_level();
        ob_start();
        try {
            $response->sendContent();
            $contents = ob_get_contents();
        } finally {
            while (ob_get_level() > $outputBufferLevel) {
                ob_end_clean();
            }
        }

        if (file_put_contents($temporaryFile, $contents) === false) {
            throw new RuntimeException('No se pudo guardar el Excel temporal para validar la exportación.');
        }

        $sheet = IOFactory::load($temporaryFile)->getActiveSheet();

        expect($sheet->getHighestRow())->toBe(19)
            ->and($sheet->rangeToArray('A1:K1')[0])->toBe([
                'Cliente',
                'Tipo',
                'Departamento',
                'DNI / RUC / CE',
                'Boletas Aceptadas',
                'Boletas Pendientes',
                'Boletas Rechazadas',
                'Puntos',
                'Estado',
                'Verificado',
                'Ganador',
            ])
            ->and($sheet->getCell('E2')->getValue())->toBe(1)
            ->and($sheet->getCell('F2')->getValue())->toBe(1)
            ->and($sheet->getCell('G2')->getValue())->toBe(1)
            ->and($sheet->getCell('H2')->getValue())->toBe(25)
            ->and($sheet->getCell('A2')->getValue())->toBe('Cliente Exportable 18 Prueba (cliente18@example.test)');
    } finally {
        if (is_file($temporaryFile) && ! unlink($temporaryFile)) {
            throw new RuntimeException('No se pudo eliminar el Excel temporal de prueba.');
        }
    }
});
