<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$svc = new TicketService();
$reflect = new ReflectionClass($svc);
$normalizeKey = $reflect->getMethod('normalizeKey');
$normalizeKey->setAccessible(true);
$normalizeValue = $reflect->getMethod('normalizeValue');
$normalizeValue->setAccessible(true);
$normalizeStatut = $reflect->getMethod('normalizeStatut');
$normalizeStatut->setAccessible(true);

$values = [
    'CLÔTURÉ',
    "CL\xc3\x94TUR\xc3\x89",
];

foreach ($values as $val) {
    echo "raw: $val\n";
    $norm = $normalizeValue->invoke($svc, $val);
    echo "normalizeValue: "; var_dump($norm);
    $status = $normalizeStatut->invoke($svc, $norm);
    echo "normalizeStatut: "; var_dump($status);
}
