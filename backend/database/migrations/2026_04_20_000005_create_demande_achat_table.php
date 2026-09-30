<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('demande_achat')) {
            Schema::create('demande_achat', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
                $table->string('email_prestataire', 150);
                $table->text('objet');
                $table->text('description');
                $table->enum('statut', ['en_attente', 'valide', 'refuse'])->default('en_attente');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_achat');
    }
};
