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
        // If the table already exists, add the id_categorie column and foreign key
        if (Schema::hasTable('sous_categorie')) {
            if (!Schema::hasColumn('sous_categorie', 'id_categorie')) {
                Schema::table('sous_categorie', function (Blueprint $table) {
                    $table->unsignedBigInteger('id_categorie')->nullable()->after('nom');
                });

                Schema::table('sous_categorie', function (Blueprint $table) {
                    $table->foreign('id_categorie')->references('id_categorie')->on('categorie')->onDelete('cascade');
                });
            }
        } else {
            Schema::create('sous_categorie', function (Blueprint $table) {
                $table->id();
                $table->string('nom', 100)->unique();
                $table->unsignedBigInteger('id_categorie')->nullable();
                $table->timestamps();

                $table->foreign('id_categorie')->references('id_categorie')->on('categorie')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sous_categorie') && Schema::hasColumn('sous_categorie', 'id_categorie')) {
            Schema::table('sous_categorie', function (Blueprint $table) {
                $table->dropForeign(['id_categorie']);
                $table->dropColumn('id_categorie');
            });
        }
    }
};
