<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('tipo_persona', ['natural', 'juridica']);
            $table->string('nombre');
            $table->string('apellidos')->nullable();
            $table->string('dni', 20)->nullable()->unique();
            $table->string('ruc', 20)->nullable()->unique();
            $table->string('departamento');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telefono', 20);
            $table->boolean('acepta_politicas')->default(false);
            $table->boolean('acepta_terminos')->default(false);
            $table->string('archivo_comprobante')->nullable();
            $table->enum('estado', ['pendiente', 'activo', 'rechazado'])->default('pendiente');
            $table->timestamp('email_verified_at')->nullable();

            // Campos Fortify 2FA
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            
            $table->string('email_verification_token')->nullable()->after('email_verified_at');
            $table->timestamp('email_verification_expires_at')->nullable()->after('email_verification_token');

            $table->rememberToken();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('tipo_persona');
            $table->index('estado');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
