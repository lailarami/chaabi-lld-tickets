<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$svc = new TicketService();

$rawRow = [
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
    'impact' => "pas d'impact",
    'Date de fermeture' => '10/01/2025 12:11',
];

$reflect = new ReflectionClass($svc);
$normalizeValue = $reflect->getMethod('normalizeValue');
$normalizeValue->setAccessible(true);
$normalizeKey = $reflect->getMethod('normalizeKey');
$normalizeKey->setAccessible(true);

$normalizedRow = [];
foreach ($rawRow as $k => $v) {
    $normalizedRow[$normalizeKey->invoke($svc, $k)] = $normalizeValue->invoke($svc, $v);
}

var_dump($normalizedRow);

$resolveUtilisateurId = $reflect->getMethod('resolveUtilisateurId');
$resolveUtilisateurId->setAccessible(true);
$resolveCategorieId = $reflect->getMethod('resolveCategorieId');
$resolveCategorieId->setAccessible(true);

$tr = $normalizedRow['ticket_traite_par'] ?? null;
$categ = $normalizedRow['categorie'] ?? null;

echo "normalized traiteur: "; var_dump($tr);
echo "normalized categorie: "; var_dump($categ);

echo "resolveUtilisateurId traiteur: "; var_dump($resolveUtilisateurId->invoke($svc, null, null, $tr, null));

echo "resolveCategorieId categorie: "; var_dump($resolveCategorieId->invoke($svc, $categ));
