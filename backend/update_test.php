<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;

$ticket = Ticket::find(31);
$oldDate = $ticket->date_en_cours;
$newDate = new DateTime('2026-04-25 00:00:00'); // 3 days ago
$ticket->update(['date_en_cours' => $newDate]);
echo 'Updated ticket 31 date_en_cours from ' . $oldDate . ' to ' . $newDate->format('Y-m-d H:i:s') . '\n';