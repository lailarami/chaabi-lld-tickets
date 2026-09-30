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
                $table->id();
                $table->unsignedBigInteger('id_ticket');
                $table->string('email_prestataire', 150);
                $table->text('objet');
                $text('description');
                $table->enum('statut', ['en_attente', 'validee', 'refusee'])->default('en_attente');
                $table->timestamps();

                $table->foreign('id_ticket')->references('id_ticket')->on('ticket')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_achat');
    }
};
