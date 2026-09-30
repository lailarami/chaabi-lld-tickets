<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sous_categorie')) {
            Schema::create('sous_categorie', function (Blueprint $table) {
                $table->id();
                $table->string('nom', 100)->unique();
                $table->timestamps();
            });

            // Insert default sous-categories
            DB::table('sous_categorie')->insert([
                ['nom' => 'FOURNITURE'],
                ['nom' => 'MATERIEL'],
                ['nom' => 'BASE DE DONNEES'],
                ['nom' => 'RÉSEAU'],
                ['nom' => 'APPLICATION'],
                ['nom' => 'MESSAGERIE'],
                ['nom' => 'INTERNET'],
                ['nom' => 'ACTIVE DIRECTORY'],
                ['nom' => 'LOGICIEL'],
                ['nom' => 'ELECTRICITE'],
                ['nom' => 'SECURITE'],
                ['nom' => 'Cisco'],
                ['nom' => 'Mise à jour'],
                ['nom' => 'Import'],
                ['nom' => 'Désaffecter'],
                ['nom' => 'Créer compte'],
                ['nom' => 'Envoi SMS'],
                ['nom' => 'Création de bon de commande'],
                ['nom' => 'Black listé'],
                ['nom' => 'Présentation'],
                ['nom' => 'Sensibilisation'],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sous_categorie');
    }
};
