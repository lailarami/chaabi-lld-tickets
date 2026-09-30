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
        Schema::table('ticket', function (Blueprint $table) {
            if (!Schema::hasColumn('ticket', 'typologie')) {
                $table->enum('typologie', ['Incident', 'Assistance', 'Infrastructure IT', 'Infrastructure MG'])->nullable();
            }
            if (!Schema::hasColumn('ticket', 'impact')) {
                $table->enum('impact', ['pas_impact', 'impact_individuel', 'impact_general'])->nullable();
            }
            if (!Schema::hasColumn('ticket', 'id_sous_categorie')) {
                $table->unsignedBigInteger('id_sous_categorie')->nullable();
                $table->foreign('id_sous_categorie')->references('id')->on('sous_categorie');
            }
            if (!Schema::hasColumn('ticket', 'traite_par')) {
                $table->unsignedBigInteger('traite_par')->nullable();
                $table->foreign('traite_par')->references('id_utilisateur')->on('utilisateur')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->dropForeign(['id_sous_categorie']);
            $table->dropForeign(['traite_par']);
            $table->dropColumn(['typologie', 'impact', 'id_sous_categorie', 'traite_par']);
        });
    }
};
