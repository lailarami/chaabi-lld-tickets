<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;

$t = Ticket::with(['sousCategorie','rapport.sousCategorie'])->whereNotNull('id_sous_categorie')->first();

if ($t) {
    echo "Ticket ID: {$t->id_ticket}\n";
    echo "Sous-catégorie ID: {$t->id_sous_categorie}\n";
    echo "Sous-catégorie Nom: " . ($t->sousCategorie ? $t->sousCategorie->nom : 'NULL') . "\n";
    echo "Rapport ID: " . ($t->rapport ? $t->rapport->id_rapport : 'NULL') . "\n";
    echo "Rapport Sous-catégorie ID: " . ($t->rapport ? $t->rapport->id_sous_categorie : 'NULL') . "\n";
    echo "Rapport Sous-catégorie Nom: " . ($t->rapport && $t->rapport->sousCategorie ? $t->rapport->sousCategorie->nom : 'NULL') . "\n";
} else {
    echo "Aucun ticket avec sous-catégorie trouvé.\n";
}