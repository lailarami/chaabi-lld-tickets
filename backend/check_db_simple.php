<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo 'Utilisateurs: ' . App\Models\Utilisateur::count() . PHP_EOL;
} catch (Exception $e) {
    echo 'Erreur Utilisateur: ' . $e->getMessage() . PHP_EOL;
}

try {
    echo 'Rôles: ' . App\Models\Role::count() . PHP_EOL;
} catch (Exception $e) {
    echo 'Erreur Role: ' . $e->getMessage() . PHP_EOL;
}

try {
    echo 'Catégories: ' . App\Models\Categorie::count() . PHP_EOL;
} catch (Exception $e) {
    echo 'Erreur Categorie: ' . $e->getMessage() . PHP_EOL;
}

try {
    echo 'Tickets: ' . App\Models\Ticket::count() . PHP_EOL;
} catch (Exception $e) {
    echo 'Erreur Ticket: ' . $e->getMessage() . PHP_EOL;
}