<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Set invalid id_sous_categorie to null
        DB::table('ticket')->whereNotNull('id_sous_categorie')->update(['id_sous_categorie' => null]);

        try {
            Schema::table('ticket', function (Blueprint $table) {
                $table->unsignedBigInteger('id_sous_categorie')->nullable()->change();
                $table->foreign('id_sous_categorie')->references('id')->on('sous_categorie')->onDelete('set null');
            });
        } catch (\Exception $e) {
            // Ignore if foreign key already exists (e.g., running migrations fresh)
        }
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->dropForeign(['id_sous_categorie']);
            $table->integer('id_sous_categorie')->nullable()->change();
        });
    }
};
