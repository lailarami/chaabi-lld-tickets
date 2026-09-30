<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tickets = App\Models\Ticket::with('utilisateur:id_utilisateur,nom')->get();
foreach($tickets as $t) {
    echo 'Ticket ' . $t->id_ticket . ': user ' . ($t->utilisateur ? $t->utilisateur->nom : 'null') . ', statut ' . $t->statut . PHP_EOL;
}