<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update enum values to match the desired statuts
        Schema::table('ticket', function (Blueprint $table) {
            // This will only work if the column doesn't have values outside the new enum
            DB::statement("ALTER TABLE ticket MODIFY statut ENUM('ouvert', 'en_cours', 'en_attente', 'cloture') NOT NULL");
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            DB::statement("ALTER TABLE ticket MODIFY statut ENUM('cree', 'en_cours', 'resolu', 'valide', 'rejete') NOT NULL");
        });
    }
};
