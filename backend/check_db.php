<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo 'Utilisateurs: ' . App\Models\Utilisateur::count() . PHP_EOL;
echo 'Rôles: ' . App\Models\Role::count() . PHP_EOL;
echo 'Catégories: ' . App\Models\Categorie::count() . PHP_EOL;
echo 'Sous Catégories: ' . App\Models\SousCategorie::count() . PHP_EOL;
echo 'Tickets: ' . App\Models\Ticket::count() . PHP_EOL;