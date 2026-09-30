<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('contrats')) {
            Schema::create('contrats', function (Blueprint $table) {
                $table->id();
                $table->string('produit', 150);
                $table->string('licence', 150);
                $table->date('date_debut');
                $table->date('date_fin');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
