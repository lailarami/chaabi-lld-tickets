<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->enum('statut', ['cree', 'en_cours', 'en_attente', 'resolu', 'valide', 'rejete', 'cloture'])->change();
            $table->enum('type_action', ['RESOLUTION_IMMEDIATE', 'ENVOI_EMAIL', 'INTERVENTION_FOURNISSEUR'])->nullable()->after('id_traiteur');
            $table->integer('niveau')->default(1)->after('type_action');
            $table->text('notes_traiteur')->nullable()->after('niveau');
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->dropColumn(['type_action', 'niveau', 'notes_traiteur']);
        });
    }
};
