<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;

// Get a ticket with subcategory
$ticket = Ticket::with(['sousCategorie','rapport.sousCategorie'])->whereNotNull('id_sous_categorie')->first();

if ($ticket) {
    // Simulate the API response
    $data = [
        'id_ticket' => $ticket->id_ticket,
        'sousCategorie' => $ticket->sousCategorie ? ['nom' => $ticket->sousCategorie->nom] : null,
        'rapport' => $ticket->rapport ? [
            'id_rapport' => $ticket->rapport->id_rapport,
            'id_sous_categorie' => $ticket->rapport->id_sous_categorie,
            'sousCategorie' => $ticket->rapport->sousCategorie ? ['nom' => $ticket->rapport->sousCategorie->nom] : null,
        ] : null,
    ];

    echo "API Response simulation:\n";
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo "No ticket with subcategory.\n";
}