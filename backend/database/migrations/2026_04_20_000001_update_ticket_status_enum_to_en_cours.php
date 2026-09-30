<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convertir en VARCHAR temporairement pour permettre la mise à jour
        DB::statement("ALTER TABLE ticket MODIFY statut VARCHAR(255)");

        // Mettre à jour en_cour à en_cours dans la base de données
        DB::table('ticket')->where('statut', 'en_cour')->update(['statut' => 'en_cours']);

        // Reconvertir en ENUM avec les bonnes valeurs
        DB::statement("ALTER TABLE ticket MODIFY statut ENUM('ouvert', 'en_cours', 'en_attente', 'cloture') NOT NULL DEFAULT 'ouvert'");
    }

    public function down(): void
    {
        // Convertir en VARCHAR temporairement
        DB::statement("ALTER TABLE ticket MODIFY statut VARCHAR(255)");

        // Mettre à jour en_cours à en_cour
        DB::table('ticket')->where('statut', 'en_cours')->update(['statut' => 'en_cour']);

        // Restaurer l'ancien ENUM
        DB::statement("ALTER TABLE ticket MODIFY statut ENUM('ouvert', 'en_cour', 'en_attente', 'cloture') NOT NULL DEFAULT 'ouvert'");
    }
};
