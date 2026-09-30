<?php
$db = new mysqli('127.0.0.1', 'root', '', 'ticketing');
if ($db->connect_error) {
    echo 'CONNECT ERR: ' . $db->connect_error . PHP_EOL;
    exit(1);
}
$res = $db->query("SHOW COLUMNS FROM demande_achat LIKE 'statut'");
if (!$res) {
    echo 'QUERY ERR: ' . $db->error . PHP_EOL;
    exit(1);
}
while ($row = $res->fetch_assoc()) {
    echo json_encode($row, JSON_UNESCAPED_UNICODE) . PHP_EOL;
}
$db->close();
