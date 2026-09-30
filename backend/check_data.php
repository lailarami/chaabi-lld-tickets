<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Categories:\n";
$categories = \App\Models\Categorie::all();
foreach ($categories as $cat) {
    echo "ID: {$cat->id_categorie}, Nom: {$cat->nom}\n";
}

echo "\nSousCategories:\n";
$sousCategories = \App\Models\SousCategorie::all();
foreach ($sousCategories as $sub) {
    echo "ID: {$sub->id}, Nom: {$sub->nom}, id_categorie: {$sub->id_categorie}\n";
}