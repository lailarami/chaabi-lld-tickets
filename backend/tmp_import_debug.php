<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$svc = new TicketService();

$rows = [[
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
    'IMPACT' => "PAS D'IMPACT",
    'date fermeture' => '10/01/2025 12:09',
]];

$result = $svc->importTickets($rows, 1);
var_dump($result);
