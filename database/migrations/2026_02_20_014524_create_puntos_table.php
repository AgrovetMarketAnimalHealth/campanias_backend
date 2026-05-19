<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puntos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignUuid('boleta_id')->constrained('boletas')->cascadeOnDelete();
            $table->foreignUuid('campania_id')->constrained('campanias')->cascadeOnDelete(); # Agregado el campo campania_id con relación a campanias
            $table->integer('puntos');
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('cliente_id');
            $table->index('boleta_id');
            $table->index('campania_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('puntos');
    }
};