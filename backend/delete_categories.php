<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=ticketing', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $names = ['Infrastructure', 'Systeme', 'Securite'];

    echo "Rechercher catégories:\n";
    $in = implode(',', array_fill(0, count($names), '?'));
    $stmt = $pdo->prepare("SELECT id_categorie, nom FROM categorie WHERE nom IN ($in)");
    $stmt->execute($names);
    $cats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($cats)) {
        echo "Aucune catégorie trouvée pour: " . implode(', ', $names) . "\n";
        exit(0);
    }

    foreach ($cats as $c) {
        echo "- {$c['id_categorie']}: {$c['nom']}\n";
        $s = $pdo->prepare('SELECT COUNT(*) as count FROM sous_categorie WHERE id_categorie = ?');
        $s->execute([$c['id_categorie']]);
        $r = $s->fetch(PDO::FETCH_ASSOC);
        echo "  Sous-catégories liées: " . $r['count'] . "\n";
    }

    echo "\nSuppression des catégories...\n";
    $del = $pdo->prepare("DELETE FROM categorie WHERE nom IN ($in)");
    $del->execute($names);

    echo "Lignes supprimées dans 'categorie': " . $del->rowCount() . "\n";

    // Check sous_categorie impact
    $stmt2 = $pdo->prepare('SELECT id, nom, id_categorie FROM sous_categorie WHERE id_categorie IS NULL OR id_categorie NOT IN (SELECT id_categorie FROM categorie)');
    $stmt2->execute();
    $orphan = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    echo "\nSous-catégories orphelines (id_categorie NULL ou invalide): " . count($orphan) . "\n";
    foreach ($orphan as $o) {
        echo "- {$o['id']}: {$o['nom']} (id_categorie=" . ($o['id_categorie'] === null ? 'NULL' : $o['id_categorie']) . ")\n";
    }

    echo "\nOpération terminée.\n";
} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . PHP_EOL;
}
