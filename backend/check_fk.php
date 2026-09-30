<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=ticketing', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query('SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = \'ticket\' AND TABLE_SCHEMA = \'ticketing\' AND REFERENCED_TABLE_NAME IS NOT NULL');
    $keys = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo 'Foreign keys on ticket:' . PHP_EOL;
    foreach ($keys as $key) {
        echo $key['CONSTRAINT_NAME'] . PHP_EOL;
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}