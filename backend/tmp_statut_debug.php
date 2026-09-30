<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TicketService;

$svc = new TicketService();
$reflect = new ReflectionClass($svc);
$normalizeString = $reflect->getMethod('normalizeString');
$normalizeString->setAccessible(true);

function normalizeStatutDebug($svc, $text) {
    $text = $normalizeString = (new ReflectionClass($svc))->getMethod('normalizeString');
    $normalizeString->setAccessible(true);
    $value = $normalizeString->invoke($svc, $text);
    echo "value: "; var_dump($value);
    $lower = mb_strtolower($value);
    echo "lower: $lower\n";
    if (function_exists('iconv')) {
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT', $lower);
        echo "iconv: "; var_dump($ascii);
    }
    $ascii = preg_replace('/[^a-z0-9 ]+/', ' ', $lower);
    echo "preg: "; var_dump($ascii);
    $ascii = trim(preg_replace('/\s+/', ' ', $ascii));
    echo "trimmed: "; var_dump($ascii);
    if (str_contains($ascii, 'clot')
        || str_contains($ascii, 'ferme')
        || str_contains($ascii, 'resol')
        || str_contains($ascii, 'valid')
        || str_contains($ascii, 'rej')) {
        echo "=> cloture\n";
        return 'cloture';
    }
    if (str_contains($ascii, 'en cours')
        || str_contains($ascii, 'encours')
        || str_contains($ascii, 'progress')
        || str_contains($ascii, 'in progress')) {
        echo "=> en_cours\n";
        return 'en_cours';
    }
    if (str_contains($ascii, 'impac') && str_contains($ascii, 'ser')
        || str_contains($ascii, 'retour')
    ) {
        echo "=> en_attente\n";
        return 'en_attente';
    }
    echo "=> ouvert\n";
    return 'ouvert';
}

normalizeStatutDebug($svc, 'CLÔTURÉ');
normalizeStatutDebug($svc, 'CLÃ”TURÃ‰');
