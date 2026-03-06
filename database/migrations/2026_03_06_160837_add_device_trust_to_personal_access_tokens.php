<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->string('ip', 45)->nullable()->after('expires_at');
            $table->string('user_agent', 255)->nullable()->after('ip');
            $table->string('pais', 100)->nullable()->after('user_agent');
            $table->string('ciudad', 100)->nullable()->after('pais');
            $table->timestamp('last_active_at')->nullable()->after('ciudad');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn(['ip', 'user_agent', 'pais', 'ciudad', 'last_active_at']);
        });
    }
};