<?php

use App\Models\Contrat;
use App\Services\TicketService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('tickets:import-reels {path} {--delimiter=,}', function ($path) {
    if (!file_exists($path)) {
        $this->error("Fichier introuvable : {$path}");
        return 1;
    }

    $delimiter = $this->option('delimiter') ?? ',';
    if ($delimiter === '\\t' || Str::lower($delimiter) === 'tab') {
        $delimiter = "\t";
    }
    $handle = fopen($path, 'r');
    if (!$handle) {
        $this->error('Impossible d ouvrir le fichier.');
        return 1;
    }

    $headers = fgetcsv($handle, 0, $delimiter);
    if ($headers === false) {
        $this->error('Impossible de lire les en-têtes du fichier.');
        fclose($handle);
        return 1;
    }

    $headers = array_map(fn ($header) => trim($header, "\xEF\xBB\xBF \t\n\r"), $headers);
    $tickets = [];

    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
        if (count($row) !== count($headers)) {
            continue;
        }
        $tickets[] = array_combine($headers, $row);
    }

    fclose($handle);

    $service = app(TicketService::class);
    $imported = $service->importTickets($tickets);

    $this->info("Tickets importés : " . count($imported));
    return 0;
})->describe('Import tickets depuis un fichier CSV ou TSV en utilisant le format réel.');

Artisan::command('contrats:clear', function () {
    Contrat::query()->delete();
    $this->info('Tous les contrats existants ont été supprimés.');
})->describe('Supprime tous les contrats existants.');
