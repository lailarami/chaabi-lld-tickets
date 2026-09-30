<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            if (!Schema::hasColumn('ticket', 'id_sous_categorie')) {
                $table->foreignId('id_sous_categorie')->nullable()->after('id_categorie')
                    ->constrained('sous_categorie', 'id')->onDelete('set null');
            }

            if (!Schema::hasColumn('ticket', 'traite_par')) {
                $table->foreignId('traite_par')->nullable()->after('id_traiteur')
                    ->constrained('utilisateur', 'id_utilisateur')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            if (Schema::hasColumn('ticket', 'traite_par')) {
                $table->dropForeign(['traite_par']);
                $table->dropColumn('traite_par');
            }
            if (Schema::hasColumn('ticket', 'id_sous_categorie')) {
                $table->dropForeign(['id_sous_categorie']);
                $table->dropColumn('id_sous_categorie');
            }
        });
    }
};
