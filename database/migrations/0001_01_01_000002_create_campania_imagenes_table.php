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
            $table->integer('orden')->default(0);

            $table->string('imagen_desktop')->nullable();
            $table->string('imagen_tablet')->nullable();
            $table->string('imagen_mobile')->nullable();
            
            $table->boolean('visible_desktop')->default(true);
            $table->boolean('visible_tablet')->default(true);
            $table->boolean('visible_mobile')->default(true);
            
            $table->boolean('activa')->default(true);

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();
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
