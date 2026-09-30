<?php
$db = new mysqli('127.0.0.1', 'root', '', 'ticketing');
if ($db->connect_error) {
    echo 'CONNECT ERR: ' . $db->connect_error . PHP_EOL;
    exit(1);
}
$res = $db->query("SHOW COLUMNS FROM ticket");
if (!$res) {
    echo 'QUERY ERR: ' . $db->error . PHP_EOL;
    exit(1);
}
while ($row = $res->fetch_assoc()) {
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL;
}
$db->close();