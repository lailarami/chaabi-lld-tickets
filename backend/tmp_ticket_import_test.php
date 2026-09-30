<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;
use Illuminate\Support\Arr;

$service = new TicketService();

$rows = [
    [
        'Date de création' => '09/01/2025 12:11',
        'N° Ticket' => '1160312',
        'Statut' => 'CLÔTURÉ',
        'Créateur Ticket' => 'AFALIH',
        'Objet ticket' => 'INCIDENT IMPRIMANTE COULEUR ( TEHCNIQUE )',
        'Description' => 'INCIDENT IMPRIMANTE COULEUR ( TEHCNIQUE )',
        'Priorité' => 'Moyenne',
        'Ticket Traité par' => 'AFALIH',
        'Typologie' => 'INCIDENT',
        'Catégorie' => 'MATERIEL info',
        'sous-Catégorie' => 'IMPRESSION',
        'impact' => 'pas d\'impact',
        'Date de fermeture' => '10/01/2025 12:11',
    ],
];

$imported = $service->importTickets($rows);

var_dump($imported);

if (!empty($imported)) {
    $ticket = $imported[0];
    echo "Created ticket ID: " . $ticket->id_ticket . " status: " . $ticket->statut . PHP_EOL;
    $loaded = $ticket->fresh();
    echo "Reloaded status: " . $loaded->statut . PHP_EOL;
}
