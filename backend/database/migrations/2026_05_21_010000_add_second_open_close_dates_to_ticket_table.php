<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            if (!Schema::hasColumn('ticket', 'date_ouverture_2')) {
                $table->date('date_ouverture_2')->nullable()->after('date_ouverture')->comment('Date when the ticket was reopened a second time');
            }

            if (!Schema::hasColumn('ticket', 'date_cloture_2')) {
                $table->date('date_cloture_2')->nullable()->after('date_cloture')->comment('Date when the ticket was closed a second time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            if (Schema::hasColumn('ticket', 'date_cloture_2')) {
                $table->dropColumn('date_cloture_2');
            }

            if (Schema::hasColumn('ticket', 'date_ouverture_2')) {
                $table->dropColumn('date_ouverture_2');
            }
        });
    }
};
