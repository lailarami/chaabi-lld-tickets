<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ticket;

// Get ticket with pending action
$ticket = Ticket::where('id_ticket', 30)
    ->with([
        'utilisateur:id_utilisateur,nom,email',
        'categorie:id_categorie,nom',
        'traiteur:id_utilisateur,nom,email',
        'traiteurActuel:id_utilisateur,nom,email',
        'sousCategorie:id,nom',
        'rapport:id_rapport,date_generation,date_fermeture,description,id_sous_categorie,typologie,impact,notes_traiteur',
        'rapport.sousCategorie:id,nom',
        'ticketHistoriques',
        'emailLogs',
        'demandeAchats'
    ])
    ->first();

if ($ticket) {
    echo "Ticket ID: {$ticket->id_ticket}\n";
    echo "Statut: {$ticket->statut}\n";
    echo "\nHistorique chargé:\n";
    if ($ticket->ticketHistoriques && count($ticket->ticketHistoriques) > 0) {
        foreach ($ticket->ticketHistoriques as $h) {
            echo "  Action: {$h->action}\n";
            echo "  Créé à: {$h->created_at}\n";
        }
    } else {
        echo "  Aucun historique chargé !\n";
    }
    
    echo "\n\nRéponse JSON:\n";
    echo json_encode($ticket, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo "Ticket non trouvé.\n";
}
