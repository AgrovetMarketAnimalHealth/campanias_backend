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
        Schema::create('campania_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignUuid('campania_id')
                ->constrained('campanias')
                ->onDelete('cascade');
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'campania_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campania_user');
    }
};
