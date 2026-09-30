<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$result = DB::select('DESCRIBE ticket');
foreach ($result as $column) {
    if ($column->Field === 'impact') {
        echo "Colonne impact:\n";
        print_r($column);
        break;
    }
}
?>