<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\Utilisateur::with('role')->get();
foreach($users as $u) {
    echo $u->id_utilisateur . ': ' . $u->nom . ' (' . $u->role->nom_role . ')' . PHP_EOL;
}