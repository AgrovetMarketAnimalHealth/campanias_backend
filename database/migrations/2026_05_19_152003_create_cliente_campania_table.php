<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_campania', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignUuid('campania_id')->constrained('campanias')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['cliente_id', 'campania_id']);
            $table->index('cliente_id');
            $table->index('campania_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_campania');
    }
};