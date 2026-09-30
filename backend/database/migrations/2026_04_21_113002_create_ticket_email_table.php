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
        if (!Schema::hasTable('ticket_email')) {
            Schema::create('ticket_email', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_ticket');
                $table->string('email_dest', 150);
                $table->string('sujet', 255);
                $table->text('contenu');
                $table->timestamp('date_envoi')->useCurrent();

                $table->foreign('id_ticket')->references('id_ticket')->on('ticket')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_email');
    }
};
