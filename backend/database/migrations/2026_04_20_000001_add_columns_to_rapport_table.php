<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rapport', function (Blueprint $table) {
            $table->unsignedBigInteger('id_sous_categorie')->nullable()->after('description');
            $table->string('typologie')->nullable()->after('id_sous_categorie');
            $table->string('impact')->nullable()->after('typologie');
            $table->text('notes_traiteur')->nullable()->after('impact');
        });
    }

    public function down(): void
    {
        Schema::table('rapport', function (Blueprint $table) {
            $table->dropColumn(['id_sous_categorie', 'typologie', 'impact', 'notes_traiteur']);
        });
    }
};
