<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->foreignId('id_categorie')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ticket', function (Blueprint $table) {
            $table->foreignId('id_categorie')->nullable(false)->change();
        });
    }
};
