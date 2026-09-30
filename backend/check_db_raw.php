<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=ticketing', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    echo 'Tables dans la base de données:' . PHP_EOL;
    foreach ($tables as $table) {
        echo '- ' . $table . PHP_EOL;
    }

    echo PHP_EOL . 'Contenu des tables:' . PHP_EOL;

    $stmt = $pdo->query('SELECT COUNT(*) as count FROM utilisateur');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Utilisateurs: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT COUNT(*) as count FROM role');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Rôles: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT COUNT(*) as count FROM categorie');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Catégories: ' . $result['count'] . PHP_EOL;

    $stmt = $pdo->query('SELECT COUNT(*) as count FROM ticket');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'Tickets: ' . $result['count'] . PHP_EOL;

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}