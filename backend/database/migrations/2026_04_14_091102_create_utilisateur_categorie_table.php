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
        Schema::create('utilisateur_categorie', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_utilisateur');
            $table->unsignedBigInteger('id_categorie');
            $table->timestamps();

            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateur')->onDelete('cascade');
            $table->foreign('id_categorie')->references('id_categorie')->on('categorie')->onDelete('cascade');
            $table->unique(['id_utilisateur', 'id_categorie']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateur_categorie');
    }
};
