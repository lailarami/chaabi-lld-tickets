<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ticket;
use App\Models\TicketHistorique;
use Illuminate\Support\Carbon;

$tickets = Ticket::with('historique')->get();
$updated = 0;
foreach ($tickets as $ticket) {
    $hist = $ticket->historique->sortBy('created_at');
    $changed = false;

    // prise en charge -> date_en_cours
    // If date_en_cours is missing or is midnight, try to set from history
    if (!$ticket->date_en_cours || (string)Carbon::parse($ticket->date_en_cours)->format('H:i:s') === '00:00:00') {
        $prise = $hist->first(function ($h) {
            $a = strtolower($h->action ?? '');
            return str_contains($a, 'pris en charge') || str_contains($a, 'prise en charge') || str_contains($a, 'repris en charge');
        });
        if ($prise) {
            $ticket->date_en_cours = Carbon::parse($prise->created_at)->toDateTimeString();
            $changed = true;
        }
    }

    // cloture -> date_cloture: set if missing or time is 00:00:00
    $cloture = $hist->first(function ($h) {
        $a = strtolower($h->action ?? '');
        return str_contains($a, 'clôtur') || str_contains($a, 'clotur') || str_contains($a, 'resolu') || str_contains($a, 'résolu');
    });
    if ($cloture && ((!$ticket->date_cloture) || (string)Carbon::parse($ticket->date_cloture)->format('H:i:s') === '00:00:00')) {
        $ticket->date_cloture = Carbon::parse($cloture->created_at)->toDateTimeString();
        $changed = true;
    }

    // reouverture -> date_ouverture_2: set if missing or midnight
    $reouverture = $hist->first(function ($h) {
        $a = strtolower($h->action ?? '');
        return str_contains($a, 'reouvert') || str_contains($a, 'reouverture') || str_contains($a, 'rouvert');
    });
    if ($reouverture && ((!$ticket->date_ouverture_2) || (string)Carbon::parse($ticket->date_ouverture_2)->format('H:i:s') === '00:00:00')) {
        $ticket->date_ouverture_2 = Carbon::parse($reouverture->created_at)->toDateTimeString();
        $changed = true;
    }

    // recloture: find first closure after reouverture; set if missing or midnight
    if ($reouverture) {
        $cloturesAfter = $hist->filter(function ($h) use ($reouverture) {
            $a = strtolower($h->action ?? '');
            return (str_contains($a, 'clôtur') || str_contains($a, 'clotur') || str_contains($a, 'resolu') || str_contains($a, 'résolu'))
                && Carbon::parse($h->created_at)->gt(Carbon::parse($reouverture->created_at));
        });
        if ($cloturesAfter->count()) {
            $first = $cloturesAfter->first();
            if ((!$ticket->date_cloture_2) || (string)Carbon::parse($ticket->date_cloture_2)->format('H:i:s') === '00:00:00') {
                $ticket->date_cloture_2 = Carbon::parse($first->created_at)->toDateTimeString();
                $changed = true;
            }
        }
    }

    if ($changed) {
        $ticket->save();
        $updated++;
        echo "Updated ticket {$ticket->id_ticket}\n";
    }
}

echo "Backfill complete. Updated: $updated tickets\n";
