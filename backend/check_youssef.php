<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tickets = App\Models\Ticket::where('id_utilisateur', 4)->get();
foreach($tickets as $t) {
    echo 'Ticket ' . $t->id_ticket . ': statut ' . $t->statut . ', created_at ' . $t->created_at . PHP_EOL;
}