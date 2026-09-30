<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$service = new TicketService();
$row = [
    'Date de création' => '09/01/2025 12:11',
    'N° Ticket' => '1160312',
    'Statut' => 'CLÔTURÉ',
    'Créateur Ticket' => 'AFALIH',
    'Objet ticket' => 'INCIDENT IMPRIMANTE COULEUR ( TEHCNIQUE )',
    'Description Ticket' => 'INCIDENT IMPRIMANTE COULEUR ( TEHCNIQUE )',
    'Priorité' => 'Moyenne',
    'Ticket Traité par' => 'AFALIH',
    'Typologie ticket' => 'INCIDENT',
    'Catégorie' => 'RÉSEAU et connexion',
    'sous-Catégorie' => 'RÉSEAU et connexion',
    'date fermeture' => '10/01/2025 12:09',
];

$result = $service->importTickets([$row]);
var_dump($result);
if (!empty($result)) {
    $ticket = $result[0];
    echo 'Ticket created: ' . $ticket->id_ticket . ' statut=' . $ticket->statut . ' id_traiteur=' . var_export($ticket->id_traiteur, true) . ' id_categorie=' . var_export($ticket->id_categorie, true) . PHP_EOL;
}
