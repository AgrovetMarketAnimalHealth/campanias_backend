<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreignUuid('boleta_id')->nullable()->constrained('boletas')->nullOnDelete();
            $table->enum('tipo', [
                'registro_cliente',
                'boleta_recibida',
                'boleta_aceptada',
                'boleta_rechazada',
                'boleta_pendiente',
                'puntos_acreditados',
                'bienvenida',
                'reenvio_verificacion',
            ]);
            $table->string('destinatario_email');
            $table->string('asunto');
            $table->text('cuerpo')->nullable();
            $table->string('brevo_message_id')->nullable();
            $table->enum('estado_envio', ['pendiente', 'enviado', 'fallido'])
                ->default('pendiente');
            $table->timestamp('leido_at')->nullable();
            $table->text('respuesta_brevo')->nullable();
            $table->timestamp('enviado_at')->nullable();
            $table->integer('intentos')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('estado_envio');
            $table->index('tipo');
            $table->index('cliente_id');
            $table->index('enviado_at');
            $table->index('leido_at');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
