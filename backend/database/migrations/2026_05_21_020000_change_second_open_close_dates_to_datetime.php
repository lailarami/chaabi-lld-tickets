<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change columns to DATETIME to store exact time of reopen/reclose
        DB::statement("ALTER TABLE `ticket` MODIFY `date_ouverture_2` DATETIME NULL");
        DB::statement("ALTER TABLE `ticket` MODIFY `date_cloture_2` DATETIME NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `ticket` MODIFY `date_ouverture_2` DATE NULL");
        DB::statement("ALTER TABLE `ticket` MODIFY `date_cloture_2` DATE NULL");
    }
};
