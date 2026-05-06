<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('campania_imagenes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campania_id')->constrained('campanias')->cascadeOnDelete();
            $table->string('seccion');
            $table->string('clave')->default('default');
            $table->string('archivo');
            $table->string('titulo')->nullable();
            $table->text('descripcion')->nullable();
            $table->integer('orden')->default(0);
            $table->boolean('activa')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['campania_id', 'seccion']);
            $table->unique(['campania_id', 'seccion', 'clave'], 'unique_seccion_clave_campania');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campania_imagenes');
    }
};
