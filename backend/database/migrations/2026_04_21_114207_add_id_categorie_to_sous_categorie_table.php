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
        Schema::table('sous_categorie', function (Blueprint $table) {
            if (!Schema::hasColumn('sous_categorie', 'id_categorie')) {
                $table->unsignedBigInteger('id_categorie');
                $table->foreign('id_categorie')->references('id_categorie')->on('categorie')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sous_categorie', function (Blueprint $table) {
            if (Schema::hasColumn('sous_categorie', 'id_categorie')) {
                $table->dropForeign(['id_categorie']);
                $table->dropColumn('id_categorie');
            }
        });
    }
};
