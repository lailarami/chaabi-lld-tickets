<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Set all existing tickets to 'Incident' (default)
        DB::table('ticket')->update(['typologie' => 'Incident']);

        // Modify the enum
        DB::statement("ALTER TABLE ticket MODIFY COLUMN typologie ENUM('Incident', 'Demande') NOT NULL DEFAULT 'Incident'");

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Restore original enum
        DB::statement("ALTER TABLE ticket MODIFY COLUMN typologie ENUM('Incident', 'Assistance', 'Infrastructure IT', 'Infrastructure MG') NULL");

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
