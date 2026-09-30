<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketAction;
use App\Models\EmailLog;
use App\Mail\TicketEnCoursMail;
use App\Mail\TicketResoluMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class TicketActionController extends Controller
{
    /**
     * Marquer un ticket comme en attente
     */
    public function markAsPending(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $this->authorize('view', $ticket);

        $request->validate([
            'description' => 'required|string|max:1000',
        ]);

        $ticket->update([
            'statut' => 'en_attente',
            'type_action' => 'INTERVENTION_FOURNISSEUR',
            'notes_traiteur' => $request->description,
        ]);

        TicketAction::create([
            'id_ticket' => $ticket->id_ticket,
            'id_utilisateur' => Auth::id(),
            'type_action' => 'INTERVENTION_FOURNISSEUR',
            'description' => $request->description,
            'statut' => 'pending',
        ]);

        return response()->json([
            'message' => 'Ticket marqué comme en attente',
            'ticket' => $ticket->load('actions'),
        ]);
    }

    /**
     * Envoyer un email à l'utilisateur
     */
    public function sendEmail(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $this->authorize('view', $ticket);

        $request->validate([
            'sujet' => 'required|string|max:255',
            'contenu' => 'required|string|max:5000',
        ]);

        try {
            Mail::to($ticket->utilisateur->email)->send(new TicketEnCoursMail($ticket));

            EmailLog::create([
                'id_ticket' => $ticket->id_ticket,
                'destinataire' => $ticket->utilisateur->email,
                'sujet' => $request->sujet,
                'contenu' => $request->contenu,
                'statut' => 'sent',
            ]);

            TicketAction::create([
                'id_ticket' => $ticket->id_ticket,
                'id_utilisateur' => Auth::id(),
                'type_action' => 'ENVOI_EMAIL',
                'description' => $request->contenu,
                'statut' => 'completed',
            ]);

            return response()->json([
                'message' => 'Email envoyé avec succès',
                'email_log' => EmailLog::latest()->first(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi de l\'email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Résoudre immédiatement
     */
    public function resolveImmediate(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $this->authorize('view', $ticket);

        $request->validate([
            'description' => 'required|string|max:1000',
        ]);

        $updateData = [
            'statut' => 'cloture',
            'type_action' => 'RESOLUTION_IMMEDIATE',
            'notes_traiteur' => $request->description,
            'date_cloture' => now()->toDateTimeString(),
        ];

        if ($ticket->id_traiteur === null && $ticket->traite_par === null) {
            $updateData['id_traiteur'] = Auth::id();
            $updateData['traite_par'] = Auth::id();
            $updateData['date_ouverture'] = now()->toDateTimeString();
        }

        $ticket->update($updateData);

        TicketAction::create([
            'id_ticket' => $ticket->id_ticket,
            'id_utilisateur' => Auth::id(),
            'type_action' => 'RESOLUTION_IMMEDIATE',
            'description' => $request->description,
            'statut' => 'completed',
        ]);

        try {
            Mail::to($ticket->utilisateur->email)->send(new TicketResoluMail($ticket));
        } catch (\Exception $e) {
            // Log error but don't fail the request
        }

        return response()->json([
            'message' => 'Ticket résolu',
            'ticket' => $ticket->load('actions'),
        ]);
    }

    /**
     * Clôturer un ticket
     */
    public function close(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $this->authorize('view', $ticket);

        $request->validate([
            'description' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'statut' => 'cloture',
            'date_cloture' => now()->toDateTimeString(),
            'notes_traiteur' => $request->description ?? $ticket->notes_traiteur,
        ];

        if ($ticket->id_traiteur === null && $ticket->traite_par === null) {
            $updateData['id_traiteur'] = Auth::id();
            $updateData['traite_par'] = Auth::id();
            $updateData['date_ouverture'] = now()->toDateTimeString();
        }

        $ticket->update($updateData);

        TicketAction::create([
            'id_ticket' => $ticket->id_ticket,
            'id_utilisateur' => Auth::id(),
            'type_action' => 'RESOLUTION_IMMEDIATE',
            'description' => $request->description ?? 'Ticket clôturé',
            'statut' => 'completed',
        ]);

        return response()->json([
            'message' => 'Ticket clôturé',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Récupérer l'historique des actions d'un ticket
     */
    public function getHistory($id)
    {
        $ticket = Ticket::findOrFail($id);
        
        $this->authorize('view', $ticket);

        return response()->json([
            'ticket' => $ticket,
            'actions' => $ticket->actions()->with('utilisateur')->orderBy('date_action', 'desc')->get(),
            'emails' => $ticket->emailLogs()->orderBy('date_envoi', 'desc')->get(),
        ]);
    }

    /**
     * Obtenir les statistiques des tickets
     */
    public function getStatistics()
    {
        $user = Auth::user()->load('role');
        $role = $user->role?->nom_role;
        
        // Si user: stats des tickets créés par l'utilisateur
        // Si traiteur: stats des tickets assignés au traiteur
        // Si admin: stats globales
        $query = Ticket::query();
        
        if ($role === 'user') {
            $query->where('id_utilisateur', $user->id_utilisateur);
        } elseif ($role === 'traiteur') {
            $query->where(function ($q) use ($user) {
                $q->where('id_traiteur', $user->id_utilisateur)
                  ->orWhere(function ($sub) {
                      $sub->whereNull('id_traiteur')->where('statut', 'ouvert');
                  });
            });
        }
        
        $total = Ticket::count(); // Always show total tickets in system
        $ouvert = (clone $query)->where('statut', 'ouvert')->count();
        $enAttente = (clone $query)->where('statut', 'en_attente')->count();
        $enCours = (clone $query)->where('statut', 'en_cours')->count();
        $clotures = (clone $query)->where('statut', 'cloture')->count();

        return response()->json([
            'total' => $total,
            'userRole' => $role,
            'statistiques' => [
                'ouvert' => [
                    'count' => $ouvert,
                    'percentage' => $total > 0 ? round(($ouvert / $total) * 100, 2) : 0,
                ],
                'en_attente' => [
                    'count' => $enAttente,
                    'percentage' => $total > 0 ? round(($enAttente / $total) * 100, 2) : 0,
                ],
                'en_cours' => [
                    'count' => $enCours,
                    'percentage' => $total > 0 ? round(($enCours / $total) * 100, 2) : 0,
                ],
                'clotures' => [
                    'count' => $clotures,
                    'percentage' => $total > 0 ? round(($clotures / $total) * 100, 2) : 0,
                ],
            ],
        ]);
    }

    /**
     * Obtenir l'historique des tickets pour un traiteur
     */
    public function getTraiteurHistory()
    {
        $traiteur = Auth::user();
        
        $tickets = Ticket::where('id_traiteur', $traiteur->id_utilisateur)
            ->with(['utilisateur', 'categorie', 'emailLogs', 'actions'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($tickets);
    }
}
