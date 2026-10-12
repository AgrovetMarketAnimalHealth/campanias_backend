<?php

use App\Jobs\GenerarBoletosSorteoJob;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
        $table->string('email');
        $table->string('telefono');
        $table->string('departamento');
        $table->string('estado');
        $table->boolean('ganador');
        $table->softDeletes();
    });

    Schema::create('boletas', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('codigo');
        $table->softDeletes();
    });

    Schema::create('puntos', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('cliente_id');
        $table->uuid('boleta_id');
        $table->uuid('campania_id');
        $table->integer('puntos');
        $table->softDeletes();
    });
});

afterEach(function () {
    Schema::dropIfExists('puntos');
    Schema::dropIfExists('boletas');
    Schema::dropIfExists('clientes');
});

it('publishes a ZIP containing a rendered ticket PDF', function () {
    $clienteId = '7dc4962d-d74b-4a1d-9fa2-7ba3dce5c005';
    $boletaId = 'f77fdc06-238a-4f78-8aa5-783bde6312d8';
    $campaniaId = '5489d14a-bb86-41bb-bd65-b45f8ac95b6b';
    $zipFilename = 'sorteo_boletos_'.$campaniaId.'_20261012_125721_ab12cd34.zip';
    $fakeStorageRoot = sys_get_temp_dir().'/campanias-backend-test-'.bin2hex(random_bytes(8));

    config(['filesystems.disks.public.root' => $fakeStorageRoot]);
    Storage::forgetDisk('public');

    DB::table('clientes')->insert([
        'id' => $clienteId,
        'tipo_persona' => 'natural',
        'nombre' => 'Prueba',
        'apellidos' => 'DomPDF',
        'dni' => '12345678',
        'email' => 'prueba@example.test',
        'telefono' => '999999999',
        'departamento' => 'Lima',
        'estado' => 'activo',
        'ganador' => false,
    ]);

    DB::table('boletas')->insert([
        'id' => $boletaId,
        'codigo' => 'BOL-TEST-001',
    ]);

    DB::table('puntos')->insert([
        'id' => 'f904de3c-4952-4855-81f0-4987b5fd691a',
        'cliente_id' => $clienteId,
        'boleta_id' => $boletaId,
        'campania_id' => $campaniaId,
        'puntos' => 501,
    ]);

    try {
        (new GenerarBoletosSorteoJob($zipFilename, $campaniaId))->handle();

        $zipPath = Storage::disk('public')->path('sorteo/'.$zipFilename);
        $zip = new ZipArchive;

        expect($zip->open($zipPath))->toBeTrue()
            ->and($zip->numFiles)->toBe(2);

        $pdfContents = [
            $zip->getFromIndex(0),
            $zip->getFromIndex(1),
        ];
        $zip->close();

        expect(array_unique(array_map(fn ($content) => substr($content, 0, 5), $pdfContents)))->toBe(['%PDF-'])
            ->and(glob(dirname($zipPath).'/*.tmp'))->toBe([]);
    } finally {
        app(Filesystem::class)->deleteDirectory($fakeStorageRoot);
    }
});
