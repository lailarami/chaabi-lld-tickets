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
        if (!Schema::hasTable('demande_achat')) {
            Schema::create('demande_achat', function (Blueprint $table) {
                $table->id('id_demande');
                $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
                $table->string('email_prestataire');
                $table->string('objet');
                $table->text('description');
                $table->enum('statut', ['en_attente', 'validee', 'refusee'])->default('en_attente');
                $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demande_achat');
    }
};
