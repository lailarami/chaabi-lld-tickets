<?php

namespace App\Http\Controllers;

use App\Mail\DemandeAchatValideeeMail;
use App\Models\DemandeAchat;
use App\Models\Ticket;
use App\Models\TicketHistorique;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class DemandeAchatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        // Seuls les validateurs et admins peuvent voir les demandes
        if ($role !== 'validateur' && $role !== 'admin') {
            abort(403, 'Vous n\'êtes pas autorisé à voir les demandes d\'achat.');
        }

        $query = DemandeAchat::with(['ticket', 'utilisateur'])
            ->whereHas('ticket');

        if ($request->filled('statut') && $request->statut !== 'tous') {
            $query->where('statut', $request->statut);
        }

        $demandes = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($demandes);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_ticket' => 'required|exists:ticket,id_ticket',
            'email_prestataire' => 'required|email',
            'copy_mail' => 'nullable|string',
            'objet' => 'required|string|max:255',
            'description' => 'required|string',
            'type_contrat' => 'required|in:avec_contrat,hors_contrat',
            'piece_jointe' => 'nullable|file|max:2048',
        ]);

        $ticket = Ticket::findOrFail($request->id_ticket);

        // Vérifier que l'utilisateur est le traiteur assigné ou le créateur du ticket
        $userId = $request->user()->id_utilisateur;
        $isAuthorized = ($ticket->traite_par === $userId) || ($ticket->id_traiteur === $userId) || ($ticket->id_utilisateur === $userId);
        if (!$isAuthorized) {
            abort(403, 'Vous n\'êtes pas autorisé à créer une demande d\'achat pour ce ticket.');
        }

        // Gérer l'upload du fichier
        $filePath = null;
        if ($request->hasFile('piece_jointe')) {
            $file = $request->file('piece_jointe');
            $filePath = $file->store('pieces_jointes', 'public');
        }

        // Créer la demande d'achat
        $demande = DemandeAchat::create([
            'id_ticket' => $request->id_ticket,
            'email_prestataire' => $request->email_prestataire,
            'copy_mail' => $request->copy_mail ?? '',
            'objet' => $request->objet,
            'description' => $request->description,
            'type_contrat' => $request->type_contrat,
            'piece_jointe' => $filePath,
            'statut' => 'en_attente',
            'id_utilisateur' => $request->user()->id_utilisateur,
        ]);

        // Mettre le ticket en attente car une déclaration de niveau 2 a été créée
        $ticket->update([
            'statut' => 'en_attente',
            'date_en_attente' => Carbon::now('Africa/Casablanca'),
        ]);

        // Ajouter à l'historique
        TicketHistorique::create([
            'id_ticket' => $ticket->id_ticket,
            'id_user' => $request->user()->id_utilisateur,
            'action' => 'Ticket mis en attente par déclaration niveau 2',
            'commentaire' => "Déclaration Niveau +2 créée pour le prestataire: {$request->email_prestataire}",
        ]);

        return response()->json([
            'message' => 'Declaration Niveau +2 créée et prête pour validation.',
            'demande' => $demande,
        ], 201);
    }

    public function valider(Request $request, int $id): JsonResponse
    {
        $demande = DemandeAchat::findOrFail($id);
        $demande->update(['statut' => 'validee']);

        // Ajouter à l'historique du ticket
        TicketHistorique::create([
            'id_ticket' => $demande->id_ticket,
            'id_user' => $request->user()->id_utilisateur,
            'action' => 'Demande d\'achat validée',
            'commentaire' => "Demande d'achat validée par le validateur",
        ]);

        // Envoyer un email au prestataire avec CC
        try {
            $mailer = Mail::to($demande->email_prestataire);

            // Ajouter les CC si fournis
            if (!empty($demande->copy_mail)) {
                $ccEmails = array_map('trim', explode(',', $demande->copy_mail));
                $mailer->cc($ccEmails);
            }

            $mailer->send(new DemandeAchatValideeeMail($demande));
        } catch (\Exception $e) {
            \Log::error('Email validation demande d\'achat échoué: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Demande d\'achat validée.',
            'demande' => $demande,
        ]);
    }

    public function refuser(Request $request, int $id): JsonResponse
    {
        $demande = DemandeAchat::findOrFail($id);
        $demande->update(['statut' => 'refusee']);

        // Ajouter à l'historique du ticket
        TicketHistorique::create([
            'id_ticket' => $demande->id_ticket,
            'id_user' => $request->user()->id_utilisateur,
            'action' => 'Demande d\'achat refusée',
            'commentaire' => "Demande d'achat refusée par le validateur",
        ]);

        // Pas d'email envoyé lors du refus selon les spécifications
        // Le statut est simplement changé à 'refusee'

        return response()->json([
            'message' => 'Demande d\'achat refusée.',
            'demande' => $demande,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $demande = DemandeAchat::findOrFail($id);
        $demande->delete();

        TicketHistorique::create([
            'id_ticket' => $demande->id_ticket,
            'id_user' => $request->user()->id_utilisateur,
            'action' => 'Demande d\'achat supprimée',
            'commentaire' => "Demande d'achat supprimée par l'utilisateur",
        ]);

        return response()->json([
            'message' => 'Demande d\'achat supprimée avec succès.',
        ]);
    }

}
