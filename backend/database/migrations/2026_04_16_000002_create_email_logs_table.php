<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
            $table->string('destinataire');
            $table->string('sujet');
            $table->longText('contenu');
            $table->timestamp('date_envoi')->useCurrent();
            $table->string('statut')->default('sent');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
