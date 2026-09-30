<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('demande_achat') && !Schema::hasColumn('demande_achat', 'type_contrat')) {
            Schema::table('demande_achat', function (Blueprint $table) {
                $table->enum('type_contrat', ['avec_contrat', 'hors_contrat'])->default('hors_contrat')->after('description');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('demande_achat') && Schema::hasColumn('demande_achat', 'type_contrat')) {
            Schema::table('demande_achat', function (Blueprint $table) {
                $table->dropColumn('type_contrat');
            });
        }
    }
};
