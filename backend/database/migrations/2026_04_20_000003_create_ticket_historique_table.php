<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ticket_historique')) {
            Schema::create('ticket_historique', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
                $table->foreignId('id_user')->nullable()->constrained('utilisateur', 'id_utilisateur')->onDelete('set null');
                $table->string('action', 100);
                $table->text('commentaire')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_historique');
    }
};
