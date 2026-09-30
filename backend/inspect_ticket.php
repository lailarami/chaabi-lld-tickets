<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ticket;

$ticket = Ticket::with(['sousCategorie','rapport','ticketHistoriques'])->find(1);
if (!$ticket) {
    echo "Ticket not found\n";
    exit(1);
}

$fields = $ticket->only(['id_ticket','id_sous_categorie','date_ouverture','date_ouverture_2','date_cloture','date_cloture_2','date_en_cours']);
$fields['sousCategorie'] = $ticket->sousCategorie ? $ticket->sousCategorie->toArray() : null;
$fields['rapport'] = $ticket->rapport ? $ticket->rapport->toArray() : null;
$fields['historique_last'] = count($ticket->ticketHistoriques) ? $ticket->ticketHistoriques->last()->toArray() : null;

print_r($fields);
