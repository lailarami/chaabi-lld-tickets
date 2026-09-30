<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Rapport;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketHistorique;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminController extends Controller
{
    // ─── UTILISATEURS ───────────────────────────────────────────────

    public function listeUtilisateurs(): JsonResponse
    {
        $utilisateurs = Utilisateur::with(['role', 'categories'])->orderBy('nom')->get();
        return response()->json($utilisateurs);
    }

    public function creerUtilisateur(Request $request): JsonResponse
    {
        $request->validate([
            'nom'      => 'required|string|max:100',
            'email'    => 'required|email|unique:utilisateur,email',
            'password' => 'required|string|min:6',
            'id_role'  => 'required|exists:role,id_role',
            'actif'    => 'sometimes|boolean',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categorie,id_categorie',
        ]);

        $utilisateur = Utilisateur::create([
            'nom'      => $request->nom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'id_role'  => $request->id_role,
            'actif'    => $request->actif ?? true,
        ]);

        // Assign categories if user is a traiteur
        if ($utilisateur->hasRole('traiteur') && $request->has('categories')) {
            $utilisateur->categories()->sync($request->categories);
        }

        return response()->json([
            'message'     => 'Utilisateur créé avec succès.',
            'utilisateur' => $utilisateur->load(['role', 'categories']),
        ], 201);
    }

    public function modifierUtilisateur(Request $request, int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);

        $request->validate([
            'nom'     => 'sometimes|string|max:100',
            'email'   => 'sometimes|email|unique:utilisateur,email,' . $id . ',id_utilisateur',
            'id_role' => 'sometimes|exists:role,id_role',
            'password'=> 'sometimes|string|min:6',
            'actif'   => 'sometimes|boolean',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categorie,id_categorie',
        ]);

        $data = $request->only(['nom', 'email', 'id_role', 'actif']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $utilisateur->update($data);

        // Update categories if user is a traiteur
        if ($utilisateur->hasRole('traiteur') && $request->has('categories')) {
            $utilisateur->categories()->sync($request->categories);
        }

        return response()->json([
            'message'     => 'Utilisateur modifié avec succès.',
            'utilisateur' => $utilisateur->load(['role', 'categories']),
        ]);
    }

    public function supprimerUtilisateur(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        
        // Vérifier si l'utilisateur a des tickets
        $ticketCount = Ticket::where('id_utilisateur', $id)->count();
        if ($ticketCount > 0) {
            return response()->json([
                'message' => "Impossible de supprimer cet utilisateur. Il a $ticketCount ticket(s) associé(s). Vous pouvez le désactiver à la place.",
                'tickets_count' => $ticketCount,
            ], 422);
        }
        
        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    public function desactiverUtilisateur(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update(['actif' => false]);
        return response()->json([
            'message' => 'Utilisateur désactivé avec succès.',
            'utilisateur' => $utilisateur,
        ]);
    }

    public function activerUtilisateur(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update(['actif' => true]);
        return response()->json([
            'message' => 'Utilisateur réactivé avec succès.',
            'utilisateur' => $utilisateur,
        ]);
    }

    // ─── ROLES ──────────────────────────────────────────────────────

    public function listeRoles(): JsonResponse
    {
        return response()->json(Role::all());
    }

    public function creerRole(Request $request): JsonResponse
    {
        $request->validate(['nom_role' => 'required|string|unique:role,nom_role']);
        $role = Role::create(['nom_role' => $request->nom_role]);
        return response()->json(['message' => 'Rôle créé.', 'role' => $role], 201);
    }

    public function modifierRole(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $request->validate(['nom_role' => 'required|string|unique:role,nom_role,' . $id . ',id_role']);
        $role->update(['nom_role' => $request->nom_role]);
        return response()->json(['message' => 'Rôle modifié.', 'role' => $role]);
    }

    public function supprimerRole(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['message' => 'Rôle supprimé.']);
    }

    // ─── CATEGORIES ─────────────────────────────────────────────────

    public function listeCategories(): JsonResponse
    {
        return response()->json(Categorie::all());
    }

    public function creerCategorie(Request $request): JsonResponse
    {
        $request->validate(['nom' => 'required|string|unique:categorie,nom']);
        $cat = Categorie::create(['nom' => $request->nom]);
        return response()->json(['message' => 'Catégorie créée.', 'categorie' => $cat], 201);
    }

    public function modifierCategorie(Request $request, int $id): JsonResponse
    {
        $cat = Categorie::findOrFail($id);
        $request->validate(['nom' => 'required|string|unique:categorie,nom,' . $id . ',id_categorie']);
        $cat->update(['nom' => $request->nom]);
        return response()->json(['message' => 'Catégorie modifiée.', 'categorie' => $cat]);
    }

    public function supprimerCategorie(int $id): JsonResponse
    {
        $cat = Categorie::findOrFail($id);
        $cat->delete();
        return response()->json(['message' => 'Catégorie supprimée.']);
    }

    // ─── DOMAINES TRAITEURS ────────────────────────────────────────

    public function listeDomainesTraiteurs(): JsonResponse
    {
        $traiteurs = Utilisateur::whereHas('role', fn($q) => $q->where('nom_role', 'traiteur'))
            ->with('categories')
            ->orderBy('nom')
            ->get();

        $categories = Categorie::all();

        return response()->json([
            'traiteurs' => $traiteurs,
            'categories' => $categories,
        ]);
    }

    public function assignerCategoriesTraiteur(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*' => 'exists:categorie,id_categorie',
        ]);

        $utilisateur = Utilisateur::findOrFail($id);

        if (!$utilisateur->hasRole('traiteur')) {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un traiteur.'], 422);
        }

        $utilisateur->categories()->sync($request->categories);

        return response()->json([
            'message' => 'Domaines du traiteur mis à jour avec succès.',
            'utilisateur' => $utilisateur->load('categories'),
        ]);
    }

    // ─── STATS GLOBALES ─────────────────────────────────────────────

    public function statsGlobales(): JsonResponse
    {
        return response()->json([
            'total_tickets'       => \App\Models\Ticket::count(),
            'tickets_ouvert'      => \App\Models\Ticket::where('statut', 'ouvert')->count(),
            'tickets_en_cours'    => \App\Models\Ticket::where('statut', 'en_cours')->count(),
            'tickets_en_attente'  => \App\Models\Ticket::where('statut', 'en_attente')->count(),
            'tickets_cloture'     => \App\Models\Ticket::where('statut', 'cloture')->count(),
            'tickets_critique'    => \App\Models\Ticket::where('priorite', 'critique')->count(),
            'total_utilisateurs'  => \App\Models\Utilisateur::count(),
            'total_traiteurs'     => \App\Models\Utilisateur::whereHas('role', fn($q) => $q->where('nom_role', 'traiteur'))->count(),
        ]);
    }

    public function kpiByMonth(Request $request): JsonResponse
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $query = Ticket::whereYear('ticket.created_at', $year)->whereMonth('ticket.created_at', $month);
        $total = $query->count();

        $startOfMonth = Carbon::create($year, $month, 1, 0, 0, 0, 'Africa/Casablanca');
        $endOfMonth = $startOfMonth->copy()->endOfMonth();
        $businessDays = 0;
        for ($date = $startOfMonth->copy(); $date->lte($endOfMonth); $date->addDay()) {
            if ($date->isWeekday()) {
                $businessDays++;
            }
        }
        $totalBusinessHours = $businessDays * 8;

        $clotures = (clone $query)->where('statut', 'cloture')->count();
        $nonClotures = $total - $clotures;
        $impactAvec = (clone $query)->where('impact', '!=', 'pas_impact')->count();
        $impactSans = $total - $impactAvec;
        $impactGeneral = (clone $query)->where('impact', 'impact_general')->count();
        $enAttente = (clone $query)->where('statut', 'en_attente')->count();
        $urgenceUrgent = (clone $query)->where('urgence', 'urgent')->count();
        $urgenceNonUrgent = (clone $query)->where('urgence', 'non_urgent')->count();

        $pasImpactDowntimeHours = (clone $query)
            ->where('impact', 'pas_impact')
            ->whereNotNull('ticket.date_cloture')
            ->select(DB::raw('SUM(TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_cloture)) as downtime'))
            ->value('downtime') ?: 0;

        $impactDowntimeHours = (clone $query)
            ->where('impact', '!=', 'pas_impact')
            ->whereNotNull('ticket.date_cloture')
            ->select(DB::raw('SUM(TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_cloture)) as downtime'))
            ->value('downtime') ?: 0;

        $totalDowntimeHours = (clone $query)
            ->whereNotNull('ticket.date_cloture')
            ->select(DB::raw('SUM(TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_cloture)) as downtime'))
            ->value('downtime') ?: 0;

        $disponibilitePasImpact = $totalBusinessHours > 0
            ? round(max(0, min(100, (($totalBusinessHours - $pasImpactDowntimeHours) / $totalBusinessHours) * 100)), 1)
            : null;

        $disponibiliteImpact = $totalBusinessHours > 0
            ? round(max(0, min(100, (($totalBusinessHours - $impactDowntimeHours) / $totalBusinessHours) * 100)), 1)
            : null;

        $disponibiliteGenerale = $totalBusinessHours > 0
            ? round(max(0, min(100, (($totalBusinessHours - $totalDowntimeHours) / $totalBusinessHours) * 100)), 1)
            : null;

        $ticketsImpactesOuCritique = (clone $query)
            ->where(function ($q) {
                $q->where('impact', '!=', 'pas_impact')
                  ->orWhere('priorite', 'critique');
            })
            ->count();

        $closedFirstTime = (clone $query)
            ->whereNotNull('date_cloture')
            ->whereNull('date_cloture_2')
            ->count();

        $closedAfterReopen = (clone $query)
            ->whereNotNull('date_cloture_2')
            ->count();

        $escaladesN2 = (clone $query)
            ->whereHas('demandeAchats')
            ->count();

        $avgHandleHours = (clone $query)
            ->whereNotNull('ticket.date_en_cours')
            ->whereRaw('TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_en_cours) >= 0')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_en_cours)) as avg_handle'))
            ->value('avg_handle');
        $avgHandleHours = $avgHandleHours !== null ? round((float) $avgHandleHours, 1) : null;

        $avgResolutionHours = (clone $query)
            ->whereNotNull('ticket.date_cloture')
            ->whereNotNull('ticket.date_en_cours')
            ->whereRaw('TIMESTAMPDIFF(HOUR, ticket.date_en_cours, ticket.date_cloture) >= 0')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, ticket.date_en_cours, ticket.date_cloture)) as avg_resolution'))
            ->value('avg_resolution');
        $avgResolutionHours = $avgResolutionHours !== null ? round((float) $avgResolutionHours, 1) : null;

        $categorieCounts = (clone $query)
            ->selectRaw('categorie.nom AS name, count(*) AS value')
            ->join('categorie', 'ticket.id_categorie', '=', 'categorie.id_categorie')
            ->groupBy('categorie.id_categorie', 'categorie.nom')
            ->orderByDesc('value')
            ->get()
            ->toArray();

        // Counts per day for the selected month
        $dailyCounts = (clone $query)
            ->selectRaw('DAY(ticket.created_at) as day, count(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();

        // Tickets created today (regardless of selected month/year)
        $todayCount = Ticket::whereDate('created_at', now()->toDateString())->count();

        return response()->json([
            'month' => $month,
            'year' => $year,
            'total' => $total,
            'clotures' => $clotures,
            'non_clotures' => $nonClotures,
            'pourcentage_cloture' => $total ? round(($clotures / $total) * 100, 1) : 0,
            'impact_avec' => $impactAvec,
            'impact_sans' => $impactSans,
            'impact_general' => $impactGeneral,
            'pourcentage_impact' => $total ? round(($impactAvec / $total) * 100, 1) : 0,
            'tickets_impactes_ou_critiques' => $ticketsImpactesOuCritique,
            'en_attente' => $enAttente,
            'pourcentage_en_attente' => $total ? round(($enAttente / $total) * 100, 1) : 0,
            'urgence_urgent' => $urgenceUrgent,
            'urgence_non_urgent' => $urgenceNonUrgent,
            'pourcentage_urgence' => $total ? round(($urgenceUrgent / $total) * 100, 1) : 0,
            'pourcentage_non_urgence' => $total ? round(($urgenceNonUrgent / $total) * 100, 1) : 0,
            'disponibilite_pas_impact' => $disponibilitePasImpact,
            'disponibilite_impact' => $disponibiliteImpact,
            'disponibilite_generale' => $disponibiliteGenerale,
            'heures_indisponibles_pas_impact' => (int) $pasImpactDowntimeHours,
            'heures_indisponibles_impact' => (int) $impactDowntimeHours,
            'heures_indisponibles_total' => (int) $totalDowntimeHours,
            'heures_totales_pas_impact' => (int) $totalBusinessHours,
            'heures_totales_impact' => (int) $totalBusinessHours,
            'heures_totales_mois' => (int) $totalBusinessHours,
            'avg_handle_hours' => $avgHandleHours,
            'avg_resolution_hours' => $avgResolutionHours,
            'closed_first_time' => $closedFirstTime,
            'closed_after_reopen' => $closedAfterReopen,
            'escalades_n2' => $escaladesN2,
            'categories' => $categorieCounts,
            'daily' => $dailyCounts,
            'today' => $todayCount,
        ]);
    }

    // ─── KPI PROFESSIONNEL ─────────────────────────────────────────

    public function kpiProfessionnel(Request $request): JsonResponse
    {
        $month = (int) $request->query('month', now()->month);
        $year  = (int) $request->query('year', now()->year);

        // ── base query for the selected month ──────────────────────────
        $base = Ticket::whereYear('ticket.created_at', $year)
                      ->whereMonth('ticket.created_at', $month);

        $total    = (clone $base)->count();
        $clotures = (clone $base)->where('statut', 'cloture')->count();

        // ── 1. Taux de résolution ──────────────────────────────────────
        $resolutionRate = $total > 0 ? round(($clotures / $total) * 100, 1) : 0;

        // ── 2. MTTR – Mean Time To Resolve (heures) ───────────────────
        $mttrResult = (clone $base)
            ->whereNotNull('date_cloture')
            ->whereNotNull('date_en_cours')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, date_en_cours, date_cloture)) as mttr'))
            ->value('mttr');
        $mttr = $mttrResult ? round((float) $mttrResult, 1) : null;

        // Fallback: use created_at vs date_cloture
        if ($mttr === null) {
            $mttrFallback = (clone $base)
                ->whereNotNull('date_cloture')
                ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, ticket.created_at, date_cloture)) as mttr'))
                ->value('mttr');
            $mttr = $mttrFallback ? round((float) $mttrFallback, 1) : 0;
        }

        // ── 3. SLA Compliance (< 48h) ─────────────────────────────────
        $closedWithDate = (clone $base)
            ->where('statut', 'cloture')
            ->whereNotNull('date_cloture')
            ->count();
        $withinSla = (clone $base)
            ->where('statut', 'cloture')
            ->whereNotNull('date_cloture')
            ->whereNotNull('ticket.created_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, ticket.created_at, date_cloture) < 48')
            ->count();
        $slaRate = $closedWithDate > 0 ? round(($withinSla / $closedWithDate) * 100, 1) : 0;

        // ── 4. Répartition par priorité ───────────────────────────────
        $byPriority = (clone $base)
            ->selectRaw('priorite, COUNT(*) as total,
                SUM(CASE WHEN statut = "cloture" THEN 1 ELSE 0 END) as resolus')
            ->groupBy('priorite')
            ->get()
            ->map(fn($r) => [
                'priorite' => $r->priorite,
                'total'    => (int) $r->total,
                'resolus'  => (int) $r->resolus,
                'taux'     => $r->total > 0 ? round(($r->resolus / $r->total) * 100, 1) : 0,
            ])->values();

        // ── 5. Tendance 6 derniers mois ───────────────────────────────
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $m = (int) $d->month;
            $y = (int) $d->year;
            $t = Ticket::whereYear('ticket.created_at', $y)->whereMonth('ticket.created_at', $m)->count();
            $c = Ticket::whereYear('ticket.created_at', $y)->whereMonth('ticket.created_at', $m)->where('statut', 'cloture')->count();
            $trends[] = [
                'label'    => $d->format('M Y'),
                'total'    => $t,
                'clotures' => $c,
            ];
        }

        // ── 6. Performance traiteurs (top 5) ──────────────────────────
        $traiteurPerf = (clone $base)
            ->where('statut', 'cloture')
            ->whereNotNull('id_traiteur')
            ->join('utilisateur as u', 'ticket.id_traiteur', '=', 'u.id_utilisateur')
            ->selectRaw('u.nom, COUNT(*) as resolus,
                AVG(TIMESTAMPDIFF(HOUR, ticket.created_at, ticket.date_cloture)) as mttr_h')
            ->groupBy('ticket.id_traiteur', 'u.nom')
            ->orderByDesc('resolus')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'nom'     => $r->nom,
                'resolus' => (int) $r->resolus,
                'mttr_h'  => $r->mttr_h ? round((float) $r->mttr_h, 1) : 0,
            ])->values();

        // ── 7. Répartition par catégorie ──────────────────────────────
        $categories = (clone $base)
            ->selectRaw('categorie.nom AS name, COUNT(*) AS value')
            ->join('categorie', 'ticket.id_categorie', '=', 'categorie.id_categorie')
            ->groupBy('categorie.id_categorie', 'categorie.nom')
            ->orderByDesc('value')
            ->get()
            ->toArray();

        // ── 8. Tickets non confirmés par l'utilisateur ────────────────
        $nonConfirmes = (clone $base)
            ->where('statut', 'cloture')
            ->where('confirme_par_utilisateur', false)
            ->count();

        // ── 9. Impact ─────────────────────────────────────────────────
        $impactAvec = (clone $base)->where('impact', '!=', 'pas_impact')->count();

        return response()->json([
            'month'           => $month,
            'year'            => $year,
            'total'           => $total,
            'clotures'        => $clotures,
            'non_clotures'    => $total - $clotures,
            'resolution_rate' => $resolutionRate,
            'mttr_heures'     => $mttr,
            'sla_rate'        => $slaRate,
            'non_confirmes'   => $nonConfirmes,
            'impact_avec'     => $impactAvec,
            'impact_sans'     => $total - $impactAvec,
            'by_priority'     => $byPriority,
            'trends'          => $trends,
            'traiteur_perf'   => $traiteurPerf,
            'categories'      => $categories,
            // legacy fields kept for backward compat
            'pourcentage_cloture'    => $resolutionRate,
            'pourcentage_impact'     => $total > 0 ? round(($impactAvec / $total) * 100, 1) : 0,
            'en_attente'             => (clone $base)->where('statut', 'en_attente')->count(),
            'pourcentage_en_attente' => 0,
            'impact_general'         => (clone $base)->where('impact', 'impact_general')->count(),
        ]);
    }

    // ─── RAPPORTS ───────────────────────────────────────────────────

    public function listeRapports(): JsonResponse
    {
        $rapports = Rapport::whereHas('tickets')
            ->with([
                'tickets' => fn($q) => $q->with([
                    'categorie:id_categorie,nom',
                    'utilisateur:id_utilisateur,nom,email',
                    'traiteur:id_utilisateur,nom,email',
                    'traiteurActuel:id_utilisateur,nom,email',
                    'sousCategorie:id,nom'
                ]),
                'sousCategorie:id,nom'
            ])
            ->orderByDesc('date_generation')
            ->get();
        return response()->json($rapports);
    }

    public function listeRapportsTraiteur(): JsonResponse
    {
        $userId = auth()->user()->id_utilisateur;
        $rapports = Rapport::whereHas('tickets', fn($q) => $q->where('id_traiteur', $userId))
            ->with([
                'tickets' => fn($q) => $q->with([
                    'utilisateur:id_utilisateur,nom,email',
                    'categorie:id_categorie,nom',
                    'traiteur:id_utilisateur,nom,email',
                    'traiteurActuel:id_utilisateur,nom,email',
                    'sousCategorie:id,nom'
                ]),
                'sousCategorie:id,nom'
            ])
            ->orderByDesc('date_generation')
            ->get();

        return response()->json($rapports);
    }

    public function modifierRapport(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'description' => 'required|string|max:500',
            'notes_traiteur' => 'nullable|string|max:1000',
        ]);

        $rapport = Rapport::findOrFail($id);
        $rapport->update($request->only(['description', 'notes_traiteur']));

        return response()->json([
            'message' => 'Rapport modifié avec succès.',
            'rapport' => $rapport,
        ]);
    }

    public function supprimerRapport(int $id): JsonResponse
    {
        $rapport = Rapport::findOrFail($id);
        $rapport->delete();
        return response()->json(['message' => 'Rapport supprimé avec succès.']);
    }
}
