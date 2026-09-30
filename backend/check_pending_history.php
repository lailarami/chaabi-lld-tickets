<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;
use App\Models\TicketHistorique;

// Get tickets with history containing "mise en attente"
$historiques = TicketHistorique::where('action', 'like', '%attente%')->get();

echo "Historiques avec 'attente':\n";
foreach ($historiques as $h) {
    echo "Ticket ID: {$h->id_ticket}\n";
    echo "  Action: {$h->action}\n";
    echo "  Créé à: {$h->created_at}\n";
    echo "  ---\n";
}

echo "\n\nTous les tickets et leurs statuts:\n";
$tickets = Ticket::all();
foreach ($tickets as $t) {
    echo "Ticket {$t->id_ticket}: {$t->statut}\n";
}

echo "\n\nHistorique d'un ticket quelconque:\n";
$ticket = Ticket::with('ticketHistoriques')->first();
if ($ticket) {
    echo "Ticket ID: {$ticket->id_ticket}\n";
    foreach ($ticket->ticketHistoriques as $h) {
        echo "  {$h->action} - {$h->created_at}\n";
    }
}
