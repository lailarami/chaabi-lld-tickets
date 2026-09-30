<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=chaabi_lld;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "TABLES IN ticketing:\n";
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    echo "\nTICKET TABLE STRUCTURE:\n";
    $stmt = $pdo->query('DESCRIBE ticket');
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        if ($col['Field'] === 'statut') {
            echo "statut: " . $col['Type'] . "\n";
        }
    }
    echo "\nSTATUS COUNTS:\n";
    $stmt = $pdo->query('SELECT statut, COUNT(*) AS count FROM ticket GROUP BY statut');
    $counts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($counts as $count) {
        echo $count['statut'] . ': ' . $count['count'] . PHP_EOL;
    }
    echo "\nCLOSED TICKETS:\n";
    $stmt = $pdo->query('SELECT id_ticket, objet_ticket, statut, id_utilisateur, id_traiteur, traite_par, date_creation, date_cloture FROM ticket WHERE statut = "cloture" ORDER BY id_ticket DESC LIMIT 20');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        echo implode(' | ', $row) . PHP_EOL;
    }
    echo "\nLATEST TICKETS:\n";
    $stmt = $pdo->query('SELECT id_ticket, numero_ticket, objet_ticket, statut, id_utilisateur, id_traiteur, traite_par, date_creation, date_cloture FROM ticket ORDER BY id_ticket DESC LIMIT 20');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        echo implode(' | ', $row) . PHP_EOL;
    }
    echo "\nCATEGORIES:\n";
    $stmt = $pdo->query('SELECT id_categorie, nom FROM categorie ORDER BY id_categorie ASC LIMIT 50');
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($categories as $cat) {
        echo $cat['id_categorie'] . ' | ' . $cat['nom'] . PHP_EOL;
    }

    echo "\nUTILISATEURS:\n";
    $stmt = $pdo->query('SELECT id_utilisateur, nom, email, id_role FROM utilisateur ORDER BY id_utilisateur ASC LIMIT 50');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        echo $user['id_utilisateur'] . ' | ' . $user['nom'] . ' | ' . $user['email'] . ' | role=' . $user['id_role'] . PHP_EOL;
    }} catch (PDOException $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
