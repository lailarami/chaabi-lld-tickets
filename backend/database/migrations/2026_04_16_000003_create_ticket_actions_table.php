<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur')->onDelete('restrict');
            $table->enum('type_action', ['RESOLUTION_IMMEDIATE', 'ENVOI_EMAIL', 'INTERVENTION_FOURNISSEUR']);
            $table->text('description');
            $table->string('statut')->default('pending');
            $table->timestamp('date_action')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_actions');
    }
};
