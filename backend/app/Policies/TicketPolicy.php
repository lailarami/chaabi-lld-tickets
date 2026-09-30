<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\Utilisateur;

class TicketPolicy
{
    public function view(Utilisateur $user, Ticket $ticket)
    {
        // Admin can view all tickets
        if ($user->role?->nom_role === 'admin') {
            return true;
        }

        // Users can only view their own tickets
        if ($user->role?->nom_role === 'user') {
            return $ticket->id_utilisateur === $user->id_utilisateur;
        }

        // Traiteurs can view tickets assigned to them,
        // or open tickets that are not yet handled by any traiteur.
        if ($user->role?->nom_role === 'traiteur') {
            return $ticket->id_traiteur === $user->id_utilisateur
                || ($ticket->id_traiteur === null && $ticket->traite_par === null);
        }

        // Validateurs can view closed tickets
        if ($user->role?->nom_role === 'validateur') {
            return $ticket->statut === 'cloture';
        }

        return false;
    }

    public function update(Utilisateur $user, Ticket $ticket)
    {
        // Only admins and traiteurs can update
        if (!in_array($user->role?->nom_role, ['admin', 'traiteur'])) {
            return false;
        }

        // Traiteurs can only update their own tickets
        if ($user->role?->nom_role === 'traiteur') {
            return $ticket->id_traiteur === $user->id_utilisateur;
        }

        return true;
    }
}
