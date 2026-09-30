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
        Schema::table('ticket', function (Blueprint $table) {
            $table->boolean('confirme_par_utilisateur')->default(false)->comment('Confirmation de clôture par l\'utilisateur');
            $table->timestamp('date_confirmation_utilisateur')->nullable()->comment('Date de confirmation de clôture');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->dropColumn(['confirme_par_utilisateur', 'date_confirmation_utilisateur']);
        });
    }
};
