<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now('Africa/Casablanca');
        $today = Carbon::today('Africa/Casablanca');
        
        // Récupérer les utilisateurs
        $traiteur = DB::table('utilisateur')->where('email', 'traiteur@chaabilld.ma')->first();
        $user = DB::table('utilisateur')->where('email', 'user@chaabilld.ma')->first();
        $validateur = DB::table('utilisateur')->where('email', 'validateur@chaabilld.ma')->first();
        
        // Récupérer les catégories
        $categories = DB::table('categorie')->pluck('id_categorie')->toArray();
        $sousCategories = DB::table('sous_categorie')->pluck('id')->toArray();
        
        if (empty($categories) || empty($sousCategories)) {
            echo "Les catégories doivent être créées avant les tickets.\n";
            return;
        }

        $tickets = [];
        $baseDate = $today->copy()->subDays(30);

        // Créer des tickets variés pour les 30 derniers jours + aujourd'hui
        for ($i = 0; $i < 50; $i++) {
            $creationDate = $baseDate->copy()->addDays($i % 35);
            
            // Déterminer le statut aléatoire
            $statut = $this->getRandomStatut();
            
            // Urgence est toujours définie (par défaut non_urgent)
            $urgence = rand(0, 1) === 0 ? 'urgent' : 'non_urgent';
            
            // Priorité est un enum
            $priorites = ['faible', 'moyenne', 'haute', 'critique'];
            $priorite = $priorites[array_rand($priorites)];
            
            $ticket = [
                'date_creation' => $creationDate->copy()->addHours(rand(8, 18)),
                'date_ouverture' => $statut !== 'ouvert' ? $creationDate->copy()->addHours(2) : null,
                'date_cloture' => $statut === 'cloture' ? $creationDate->copy()->addHours(6) : null,
                'heure_creation' => $creationDate->copy()->addHours(rand(8, 18))->format('H:i:s'),
                'statut' => $statut,
                'objet_ticket' => "Ticket de support #{$i}",
                'description' => "Description du ticket de support numéro {$i}",
                'urgence' => $urgence,
                'impact' => $this->getRandomImpact(),
                'priorite' => $priorite,
                'confirme_par_utilisateur' => $statut === 'cloture' ? (rand(0, 1) === 0 ? 1 : 0) : 0,
                'date_confirmation_utilisateur' => ($statut === 'cloture' && rand(0, 1) === 0) ? $creationDate->copy()->addHours(7) : null,
                'id_utilisateur' => $user->id_utilisateur,
                'id_traiteur' => $traiteur->id_utilisateur,
                'traite_par' => $traiteur->id_utilisateur,
                'id_categorie' => $categories[array_rand($categories)],
                'id_sous_categorie' => $sousCategories[array_rand($sousCategories)],
                'id_rapport' => null,
            ];
            
            $tickets[] = $ticket;
        }

        // Insérer tous les tickets
        DB::table('ticket')->insert($tickets);
        
        // Créer des demandes d'achat pour quelques tickets clôturés (escalade N+2)
        $closedTickets = DB::table('ticket')
            ->where('statut', 'cloture')
            ->limit(5)
            ->pluck('id_ticket')
            ->toArray();
        
        foreach ($closedTickets as $ticketId) {
            DB::table('demande_achat')->insert([
                'id_ticket' => $ticketId,
                'email_prestataire' => 'prestataire@example.com',
                'statut' => rand(0, 1) === 0 ? 'validee' : 'en_attente',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        
        // Créer des réouvertures pour quelques tickets clôturés
        $ticketsToReopen = DB::table('ticket')
            ->where('statut', 'cloture')
            ->where('confirme_par_utilisateur', 0)
            ->limit(3)
            ->pluck('id_ticket', 'id_ticket')
            ->toArray();
        
        foreach ($ticketsToReopen as $ticketId) {
            // Créer l'historique de réouverture
            DB::table('ticket_historique')->insert([
                'id_ticket' => $ticketId,
                'id_user' => $traiteur->id_utilisateur,
                'action' => 'Ticket réouvert',
                'commentaire' => 'Réouvert pour complément d\'information',
                'created_at' => $now->copy()->addHours(1),
                'updated_at' => $now->copy()->addHours(1),
            ]);
        }
        
        echo "✅ " . count($tickets) . " tickets créés avec succès!\n";
    }
    
    private function getRandomStatut(): string
    {
        $statuts = ['ouvert', 'en_cours', 'en_attente', 'cloture'];
        $weights = [10, 20, 15, 55]; // Plus de clôturés pour le KPI
        
        $total = array_sum($weights);
        $rand = rand(1, $total);
        $sum = 0;
        
        foreach ($statuts as $i => $statut) {
            $sum += $weights[$i];
            if ($rand <= $sum) {
                return $statut;
            }
        }
        
        return 'ouvert';
    }
    
    private function getRandomImpact(): string
    {
        $impacts = ['pas_impact', 'impact_individuel', 'impact_general'];
        return $impacts[array_rand($impacts)];
    }
}
