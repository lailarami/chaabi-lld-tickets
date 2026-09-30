<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->enum('statut', ['ouvert', 'en_cour', 'en_attente', 'cloture'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->enum('statut', ['cree', 'en_cours', 'en_attente', 'resolu', 'valide', 'rejete', 'cloture'])->change();
        });
    }
};
