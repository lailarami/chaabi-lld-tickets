<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$svc = new TicketService();

$row = [
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
$resolveUtilisateurId = $reflect->getMethod('resolveUtilisateurId');
$resolveUtilisateurId->setAccessible(true);
$resolveCategorieId = $reflect->getMethod('resolveCategorieId');
$resolveCategorieId->setAccessible(true);
$normalizeKey = $reflect->getMethod('normalizeKey');
$normalizeKey->setAccessible(true);

function getValue($svc, $normalizeValue, $normalizeKey, $row, $key) {
    $normalizedKey = $normalizeKey->invoke($svc, $key);
    return $normalizeValue->invoke($svc, $row[$normalizedKey] ?? null);
}

$tr = getValue($svc, $normalizeValue, $normalizeKey, $row, 'Ticket Traité par');
$categ = getValue($svc, $normalizeValue, $normalizeKey, $row, 'Catégorie');

echo "normalized traiteur: "; var_dump($tr);
echo "normalized categorie: "; var_dump($categ);

echo "resolveUtilisateurId traiteur: "; var_dump($resolveUtilisateurId->invoke($svc, null, null, $tr, null));

echo "resolveCategorieId categorie: "; var_dump($resolveCategorieId->invoke($svc, $categ));
