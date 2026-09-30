<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;

$tickets = Ticket::whereIn('statut', ['en_cours', 'en_attente'])->get();

echo "Tickets en_cours ou en_attente:\n";
foreach($tickets as $t) {
    $referenceDate = null;
    if ($t->statut === 'en_cours' && $t->date_en_cours) {
        $referenceDate = $t->date_en_cours;
    } elseif ($t->statut === 'en_attente' && $t->date_en_attente) {
        $referenceDate = $t->date_en_attente;
    } elseif ($t->date_ouverture) {
        $referenceDate = $t->date_ouverture;
    } elseif ($t->date_creation) {
        $referenceDate = $t->date_creation;
    }

    if (!$referenceDate) {
        echo "ID: {$t->id_ticket} - Statut: {$t->statut} - No reference date\n";
        continue;
    }

    $created = new DateTime($referenceDate);
    $now = new DateTime();
    $diff = $now->diff($created);
    $hours = $diff->h + ($diff->days * 24);

    $isOverdue = $hours >= 48;
    echo "ID: {$t->id_ticket} - Statut: {$t->statut} - Date: {$referenceDate} - Âge: {$hours}h - Overdue: " . ($isOverdue ? 'YES' : 'NO') . "\n";
}