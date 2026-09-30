<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket', function (Blueprint $table) {
            $table->id('id_ticket');
            $table->date('date_creation');
            $table->time('heure_creation');
            $table->date('date_ouverture')->nullable();
            $table->date('date_cloture')->nullable();
            $table->string('objet_ticket', 255);
            $table->enum('statut', ['cree', 'en_cours', 'resolu', 'valide', 'rejete'])->default('cree');
            $table->enum('priorite', ['faible', 'moyenne', 'haute', 'critique'])->default('moyenne');
            $table->text('description');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur')->onDelete('restrict');
            $table->foreignId('id_categorie')->constrained('categorie', 'id_categorie')->onDelete('restrict');
            $table->foreignId('id_rapport')->nullable()->constrained('rapport', 'id_rapport')->onDelete('set null');
            $table->foreignId('id_traiteur')->nullable()->constrained('utilisateur', 'id_utilisateur')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket');
    }
};
