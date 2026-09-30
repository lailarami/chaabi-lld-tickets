<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ticket_email')) {
            Schema::create('ticket_email', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_ticket')->constrained('ticket', 'id_ticket')->onDelete('cascade');
                $table->string('email_dest', 150);
                $table->string('sujet', 255);
                $table->text('contenu');
                $table->timestamp('date_envoi')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_email');
    }
};
