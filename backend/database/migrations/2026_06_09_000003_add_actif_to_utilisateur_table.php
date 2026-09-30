<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('utilisateur', 'actif')) {
            Schema::table('utilisateur', function (Blueprint $table) {
                $table->boolean('actif')->default(true)->after('id_role')->comment('Utilisateur actif ou inactif');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('utilisateur', 'actif')) {
            Schema::table('utilisateur', function (Blueprint $table) {
                $table->dropColumn('actif');
            });
        }
    }
};
