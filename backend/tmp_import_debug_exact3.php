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
$resolveUtilisateurId = $reflect->getMethod('resolveUtilisateurId');
$resolveUtilisateurId->setAccessible(true);
$resolveCategorieId = $reflect->getMethod('resolveCategorieId');
$resolveCategorieId->setAccessible(true);

$row = [
    'Ticket Traité par' => 'AFALIH',
    'Catégorie' => 'RÉSEAU et connexion',
    'sous-Catégorie' => 'RÉSEAU et connexion',
];

$ticketTraitePar = $normalizeValue->invoke($service, $row['Ticket Traité par']);
$categorieNom = $normalizeValue->invoke($service, $row['Catégorie']);
$sousCategorieNom = $normalizeValue->invoke($service, $row['sous-Catégorie']);

$idTraiteur = $resolveUtilisateurId->invoke($service, null, null, $ticketTraitePar, null);
$idCategorie = $resolveCategorieId->invoke($service, $categorieNom);

var_dump(['ticketTraitePar' => $ticketTraitePar, 'categorieNom' => $categorieNom, 'sousCategorieNom' => $sousCategorieNom, 'idTraiteur' => $idTraiteur, 'idCategorie' => $idCategorie]);
