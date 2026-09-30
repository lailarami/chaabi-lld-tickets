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
        if (!Schema::hasTable('ticket_historique')) {
            Schema::create('ticket_historique', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_ticket');
                $table->unsignedBigInteger('id_user')->nullable();
                $table->string('action', 100);
                $table->text('commentaire')->nullable();
                $table->timestamps();

                $table->foreign('id_ticket')->references('id_ticket')->on('ticket')->onDelete('cascade');
                $table->foreign('id_user')->references('id_utilisateur')->on('utilisateur')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_historique');
    }
};
