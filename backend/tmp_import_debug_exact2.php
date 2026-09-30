<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$service = new TicketService();
$reflect = new ReflectionClass($service);
$normalizeKey = $reflect->getMethod('normalizeKey');
$normalizeKey->setAccessible(true);
$normalizeValue = $reflect->getMethod('normalizeValue');
$normalizeValue->setAccessible(true);

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

$normalizedRow = [];
foreach ($row as $key => $value) {
    $normalizedKey = $normalizeKey->invoke($service, $key);
    $normalizedValue = $normalizeValue->invoke($service, $value);
    $normalizedRow[$normalizedKey] = $normalizedValue;
}

var_dump($normalizedRow);

echo "normalize('objet_ticket'): ";
$fn = fn($keys) => $normalizeValue->invoke($service, $normalizedRow[$normalizeKey->invoke($service, $keys)] ?? null);
var_dump($fn('objet_ticket'));
var_dump($fn('objet'));
var_dump($fn('titre'));
var_dump($fn('subject'));
var_dump($fn('object'));

echo "normalize('description_ticket'): ";
var_dump($fn('description_ticket'));
var_dump($fn('desc'));
var_dump($fn('contenu'));

echo "normalize('ticket_traite_par'): ";
var_dump($fn('ticket_traite_par'));
var_dump($fn('ticket_traité_par'));

echo "normalize('date_de_creation'): ";
var_dump($fn('date_de_creation'));

echo "normalize('date_fermeture'): ";
var_dump($fn('date_fermeture'));
