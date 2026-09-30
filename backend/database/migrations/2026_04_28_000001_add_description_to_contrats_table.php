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
        if (Schema::hasTable('contrats')) {
            Schema::table('contrats', function (Blueprint $table) {
                if (!Schema::hasColumn('contrats', 'description')) {
                    $table->text('description')->nullable()->after('licence');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('contrats')) {
            Schema::table('contrats', function (Blueprint $table) {
                if (Schema::hasColumn('contrats', 'description')) {
                    $table->dropColumn('description');
                }
            });
        }
    }
};
