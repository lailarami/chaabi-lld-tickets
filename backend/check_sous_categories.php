<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;
use App\Models\SousCategorie;
use App\Models\Rapport;

echo "=== Vérification des sous-catégories ===\n\n";

echo "Sous-catégories:\n";
$sousCats = SousCategorie::all();
foreach ($sousCats as $sc) {
    echo "  Nom: {$sc->nom}\n";
}

echo "\n=== Tickets avec sous-catégorie ===\n";
$ticketsWithSousCat = Ticket::whereNotNull('id_sous_categorie')->get();

foreach ($ticketsWithSousCat as $ticket) {
    $sousCat = $ticket->sousCategorie;
    echo "Ticket ID: {$ticket->id_ticket}, Sous-catégorie: " . ($sousCat ? $sousCat->nom : 'NULL') . "\n";
}

echo "\n=== Rapports avec sous-catégorie ===\n";
$rapportsWithSousCat = Rapport::whereNotNull('id_sous_categorie')->get();

foreach ($rapportsWithSousCat as $rapport) {
    $sousCat = $rapport->sousCategorie;
    echo "Rapport ID: {$rapport->id_rapport}, Sous-catégorie: " . ($sousCat ? $sousCat->nom : 'NULL') . "\n";
}

?>