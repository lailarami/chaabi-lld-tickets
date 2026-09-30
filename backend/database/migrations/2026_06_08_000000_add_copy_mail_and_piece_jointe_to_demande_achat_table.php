<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('demande_achat')) {
            Schema::table('demande_achat', function (Blueprint $table) {
                if (!Schema::hasColumn('demande_achat', 'copy_mail')) {
                    $table->string('copy_mail')->nullable()->after('email_prestataire');
                }
                if (!Schema::hasColumn('demande_achat', 'piece_jointe')) {
                    $table->string('piece_jointe')->nullable()->after('type_contrat');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('demande_achat')) {
            Schema::table('demande_achat', function (Blueprint $table) {
                if (Schema::hasColumn('demande_achat', 'copy_mail')) {
                    $table->dropColumn('copy_mail');
                }
                if (Schema::hasColumn('demande_achat', 'piece_jointe')) {
                    $table->dropColumn('piece_jointe');
                }
            });
        }
    }
};
