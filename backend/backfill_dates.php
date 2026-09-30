<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;
use App\Models\TicketHistorique;

$tickets = Ticket::all();

foreach($tickets as $ticket) {
    $updates = [];

    // Set date_ouvert if not set and ticket is ouvert
    if (!$ticket->date_ouvert && $ticket->statut === 'ouvert') {
        $updates['date_ouvert'] = $ticket->created_at;
    }

    // Check history for status changes
    $histories = $ticket->ticketHistoriques()->orderBy('created_at')->get();

    foreach($histories as $history) {
        if (str_contains($history->action, 'pris en charge') && !$ticket->date_en_cours) {
            $updates['date_en_cours'] = $history->created_at;
        }
        if (str_contains($history->action, 'mis en attente') && !$ticket->date_en_attente) {
            $updates['date_en_attente'] = $history->created_at;
        }
    }

    // For current status
    if ($ticket->statut === 'en_cours' && !$ticket->date_en_cours) {
        // If no history, use date_ouverture or created_at
        $updates['date_en_cours'] = $ticket->date_ouverture ?: $ticket->created_at;
    }
    if ($ticket->statut === 'en_attente' && !$ticket->date_en_attente) {
        // If no history, use date_ouverture or created_at
        $updates['date_en_attente'] = $ticket->date_ouverture ?: $ticket->created_at;
    }

    if (!empty($updates)) {
        $ticket->update($updates);
        echo "Updated ticket {$ticket->id_ticket}: " . json_encode($updates) . "\n";
    }
}

echo "Backfill completed.\n";