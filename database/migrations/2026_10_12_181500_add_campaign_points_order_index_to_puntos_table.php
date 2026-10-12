<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('puntos', function (Blueprint $table) {
            $table->index(['campania_id', 'puntos', 'id'], 'puntos_campania_puntos_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('puntos', function (Blueprint $table) {
            $table->dropIndex('puntos_campania_puntos_id_index');
        });
    }
};
