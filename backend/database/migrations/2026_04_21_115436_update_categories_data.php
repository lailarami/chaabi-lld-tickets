<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Clear existing categories and subcategories
        DB::table('sous_categorie')->delete();
        DB::table('categorie')->delete();

        $categories = [
            'MATERIEL info',
            'BASE DE DONNEES',
            'RÉSEAU et connexion',
            'APPLICATION',
            'MESSAGERIE',
            'INTERNET',
            'ACTIVE DIRECTORY',
            'LOGICIEL',
            'INFRASTRUCTURE IT',
            'SECURITE IT',
            'Cisco et telephonie',
            'ACCESSOIR INFORMATIQUE',
            'PORTAIL WEB',
        ];

        foreach ($categories as $nom) {
            DB::table('categorie')->insertOrIgnore(['nom' => $nom]);
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('sous_categorie')->delete();
        DB::table('categorie')->delete();

        // Restore original
        $original = [
            'Infrastructure',
            'Systeme',
            'Securite',
        ];

        foreach ($original as $nom) {
            DB::table('categorie')->insertOrIgnore(['nom' => $nom]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
