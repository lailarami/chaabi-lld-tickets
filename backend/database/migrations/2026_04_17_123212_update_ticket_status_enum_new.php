<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Convertir la colonne en VARCHAR pour permettre la mise à jour
        DB::statement("ALTER TABLE ticket MODIFY statut VARCHAR(255)");

        // Mettre à jour les données existantes
        DB::table('ticket')->where('statut', 'en_cours')->update(['statut' => 'en_cour']);
        DB::table('ticket')->where('statut', 'cree')->update(['statut' => 'ouvert']);
        DB::table('ticket')->where('statut', 'resolu')->update(['statut' => 'cloture']);
        DB::table('ticket')->where('statut', 'valide')->update(['statut' => 'cloture']);
        DB::table('ticket')->where('statut', 'rejete')->update(['statut' => 'cloture']);

        // Reconvertir en ENUM avec les nouvelles valeurs
        DB::statement("ALTER TABLE ticket MODIFY statut ENUM('ouvert', 'en_cour', 'en_attente', 'cloture') NOT NULL DEFAULT 'ouvert'");
    }

    public function down(): void
    {
        // Reconvertir à l'ancien ENUM
        DB::statement("ALTER TABLE ticket MODIFY statut VARCHAR(255)");
        DB::table('ticket')->where('statut', 'en_cour')->update(['statut' => 'en_cours']);
        DB::table('ticket')->where('statut', 'ouvert')->update(['statut' => 'cree']);
        DB::table('ticket')->where('statut', 'cloture')->update(['statut' => 'resolu']);
        DB::statement("ALTER TABLE ticket MODIFY statut ENUM('cree', 'en_cours', 'en_attente', 'resolu', 'valide', 'rejete', 'cloture') NOT NULL DEFAULT 'cree'");
    }
};
