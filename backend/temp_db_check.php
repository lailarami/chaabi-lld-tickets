<?php
$db = new mysqli('127.0.0.1', 'root', '', 'ticketing');
if ($db->connect_error) {
    echo 'CONNECT ERR: ' . $db->connect_error . PHP_EOL;
    exit(1);
}
$res = $db->query('SELECT id_demande, statut FROM demande_achat LIMIT 10');
if (!$res) {
    echo 'QUERY ERR: ' . $db->error . PHP_EOL;
    exit(1);
}
while ($row = $res->fetch_assoc()) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . PHP_EOL;
}
$db->close();
