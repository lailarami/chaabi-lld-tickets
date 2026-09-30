<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Changer date_cloture de DATE à DATETIME pour enregistrer l'heure exacte
        DB::statement("ALTER TABLE `ticket` MODIFY `date_cloture` DATETIME NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `ticket` MODIFY `date_cloture` DATE NULL");
    }
};
