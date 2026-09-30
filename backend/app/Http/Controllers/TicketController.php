<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Carbon\Carbon;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    public function __construct(private TicketService $ticketService) {}

    private function loadTicketRelations(Ticket $ticket): Ticket
    {
        return $ticket->fresh([
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
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        $query = Ticket::with([
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
        ]);

        if ($role === 'user') {
            $query->where('id_utilisateur', $user->id_utilisateur);
        } elseif ($role === 'traiteur') {
            // Traiteurs voient tous les tickets, mais peuvent seulement agir sur ceux qui leur sont assignés ou ouverts
        } elseif ($role === 'validateur') {
            // Les validateurs voient tous les tickets, mais ne valident que les déclarations niveau 2.
        } elseif ($role === 'admin' && $request->filled('mes') && $request->mes === '1') {
            $query->where('id_utilisateur', $user->id_utilisateur);
        }
        // admin sees all by default

        if ($request->filled('statut')) {
            if ($request->statut === 'non_cloture') {
                $query->where('statut', '!=', 'cloture');
            } else {
                $query->where('statut', $request->statut);
            }
        }
        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }
        if ($request->filled('id_categorie')) {
            $query->where('id_categorie', $request->id_categorie);
        }
        if ($request->filled('impact')) {
            if ($request->impact === 'has_impact') {
                $query->where('impact', '!=', 'pas_impact');
            } elseif ($request->impact === 'pas_impact') {
                $query->where('impact', 'pas_impact');
            } else {
                $query->where('impact', $request->impact);
            }
        }
        if ($request->filled('confirme_par_utilisateur')) {
            if ($request->confirme_par_utilisateur === '1' || strtolower($request->confirme_par_utilisateur) === 'true') {
                $query->where('statut', 'cloture')->where('confirme_par_utilisateur', true);
            } elseif ($request->confirme_par_utilisateur === '0' || strtolower($request->confirme_par_utilisateur) === 'false') {
                $query->where('statut', 'cloture')->where('confirme_par_utilisateur', false);
            }
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('objet_ticket', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'objet_ticket' => 'required|string|max:255',
            'description' => 'required|string',
            'priorite' => 'required|in:faible,moyenne,haute,critique',
            'id_categorie' => 'nullable|exists:categorie,id_categorie',
            'id_sous_categorie' => 'nullable|exists:sous_categorie,id',
            'impact' => 'nullable|in:pas_impact,impact_individuel,impact_general',
        ]);

        $ticket = $this->ticketService->creerTicket(
            $request->only(['objet_ticket', 'description', 'priorite', 'id_categorie', 'id_sous_categorie', 'impact']),
            $request->user()->id_utilisateur
        );

        return response()->json([
            'message' => 'Ticket créé avec succès.',
            'ticket' => $ticket,
        ], 201);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required_without:tickets|file|mimes:csv,txt,xlsx,xls|max:10240',
            'delimiter' => 'nullable|string',
            'tickets' => 'required_without:file|array',
        ]);

        $rows = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            Log::info('Importing file', [
                'name' => $file->getClientOriginalName(),
                'extension' => $extension,
                'size' => $file->getSize(),
            ]);

            try {
                if (in_array($extension, ['xlsx', 'xls'])) {
                    $rows = $this->readExcelFile($file);
                } else {
                    $rows = $this->readCsvFile($file, $request->input('delimiter', 'auto'));
                }
            } catch (\Exception $e) {
                Log::error('File import error', ['error' => $e->getMessage()]);
                return response()->json([
                    'message' => 'Erreur lors de la lecture du fichier: ' . $e->getMessage(),
                ], 422);
            }

            Log::info('Rows extracted', ['count' => count($rows)]);
        } else {
            $rows = $request->input('tickets', []);
        }

        $result = $this->ticketService->importTickets($rows, $request->user()->id_utilisateur);
        $imported = $result['imported'] ?? [];
        $diagnostics = $result['diagnostics'] ?? [];

        Log::info('Import completed', ['imported' => count($imported), 'total' => count($rows), 'diagnostics' => count($diagnostics)]);

        // If parsing produced rows but nothing was imported, return helpful debug info
        if (count($rows) > 0 && count($imported) === 0) {
            return response()->json([
                'message' => 'Aucune ligne importée — vérifiez les en-têtes/colonnes et le format du fichier.',
                'imported' => 0,
                'total_rows' => count($rows),
                'sample_row' => $rows[0] ?? null,
                'diagnostics' => array_slice($diagnostics, 0, 10),
            ], 422);
        }

        return response()->json([
            'message' => 'Tickets importés avec succès.',
            'imported' => count($imported),
            'tickets' => $imported,
            'total_rows' => count($rows),
            'diagnostics' => array_slice($diagnostics, 0, 10),
        ], 201);
    }

    private function readCsvFile($file, $delimiter = 'auto'): array
    {
        $filePath = $file->getRealPath();
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw new \Exception('Impossible d\'ouvrir le fichier CSV.');
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);
            throw new \Exception('Impossible de lire le fichier CSV.');
        }

        if ($delimiter === 'tab') {
            $delimiter = "\t";
        } elseif ($delimiter === 'comma' || $delimiter === ',') {
            $delimiter = ',';
        } elseif ($delimiter === 'semicolon' || $delimiter === ';') {
            $delimiter = ';';
        } elseif ($delimiter === 'auto') {
            $delimiter = $this->detectCsvDelimiter($firstLine);
        }

        rewind($handle);

        $rows = [];
        $headers = fgetcsv($handle, 0, $delimiter);
        
        if ($headers === false) {
            fclose($handle);
            throw new \Exception('Impossible de lire les en-têtes du fichier CSV.');
        }

        $headers = array_map(fn ($header) => $this->convertToUtf8(trim($header, "\xEF\xBB\xBF \t\n\r")), $headers);
        $headerCount = count($headers);

        // If headers look wrong, try alternative delimiters
        if ($delimiter === 'auto' || $headerCount <= 1) {
            $fallback = $this->tryAlternativeCsvDelimiter($firstLine, $headers, $delimiter);
            if ($fallback !== $delimiter) {
                $delimiter = $fallback;
                rewind($handle);
                $headers = fgetcsv($handle, 0, $delimiter);
                if ($headers === false) {
                    fclose($handle);
                    throw new \Exception('Impossible de lire les en-têtes du fichier CSV après tentative de détection.');
                }
                $headers = array_map(fn ($header) => $this->convertToUtf8(trim($header, "\xEF\xBB\xBF \t\n\r")), $headers);
                $headerCount = count($headers);
            }
        }

        \Log::info('CSV headers detected', [
            'headers' => $headers,
            'delimiter' => $delimiter,
            'header_count' => $headerCount
        ]);
        
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (count($row) === 1 && $row[0] === null) {
                continue;
            }

            if (count($row) < $headerCount) {
                $row = array_pad($row, $headerCount, null);
            } elseif (count($row) > $headerCount) {
                $row = array_slice($row, 0, $headerCount);
            }

            $row = array_map(fn ($value) => is_string($value) ? $this->convertToUtf8($value) : $value, $row);
            $rows[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        return $rows;
    }

    private function tryAlternativeCsvDelimiter(string $firstLine, array $headers, string $currentDelimiter): string
    {
        if (count($headers) > 1 && $currentDelimiter !== 'auto') {
            return $currentDelimiter;
        }

        $candidates = [',', ';', "\t", '|'];
        foreach ($candidates as $candidate) {
            if ($candidate === $currentDelimiter) {
                continue;
            }

            $parsed = str_getcsv($firstLine, $candidate);
            if (count($parsed) > 1) {
                return $candidate;
            }
        }

        return $currentDelimiter;
    }

    private function detectCsvDelimiter(string $line): string
    {
        $candidates = [';', ',', "\t", '|'];
        $counts = [];

        foreach ($candidates as $candidate) {
            $counts[$candidate] = substr_count($line, $candidate);
        }

        arsort($counts);
        $best = key($counts);

        // If no delimiters found, default to comma (common for CSV)
        if ($counts[$best] === 0) {
            return ',';
        }

        // Prefer comma when it is tied for the highest count.
        if ($counts[','] === $counts[$best] && $counts[','] > 0) {
            return ',';
        }

        // Special case: if comma has count > 0 and semicolon has 0, prefer comma.
        if ($counts[','] > 0 && $counts[';'] === 0) {
            return ',';
        }

        return $best;
    }

    private function readExcelFile($file): array
    {
        $rows = [];
        $filePath = $file->getRealPath();

        // Try using Maatwebsite Excel if available
        if (class_exists('Maatwebsite\Excel\Facades\Excel')) {
            try {
                $sheets = \Maatwebsite\Excel\Facades\Excel::toArray(new \stdClass(), $file);
                $rows = $this->processExcelSheets($sheets);
            } catch (\Exception $e) {
                Log::warning('Maatwebsite Excel failed', ['error' => $e->getMessage()]);
                $rows = $this->readExcelWithSpreadsheet($file);
            }
        } else {
            // Use PhpSpreadsheet directly
            $rows = $this->readExcelWithSpreadsheet($file);
        }

        return $rows;
    }

    private function processExcelSheets($sheets): array
    {
        $rows = [];

        if (!is_array($sheets) || empty($sheets) || !is_array($sheets[0])) {
            throw new \Exception('Le fichier Excel est vide ou invalide.');
        }

        $firstSheet = $sheets[0];
        if (empty($firstSheet)) {
            throw new \Exception('Le fichier Excel est vide.');
        }

        $headers = array_shift($firstSheet);
        if (!is_array($headers)) {
            throw new \Exception('Impossible de lire les en-têtes du fichier Excel.');
        }

        $headers = array_map(fn ($h) => $this->convertToUtf8(trim((string) ($h ?? ''))), $headers);

        foreach ($firstSheet as $row) {
            if (!is_array($row)) {
                continue;
            }

            $combinedRow = [];
            foreach ($headers as $index => $header) {
                $value = $row[$index] ?? null;
                if (is_string($value)) {
                    $value = $this->convertToUtf8($value);
                }
                $combinedRow[$header] = (is_string($value) && $value === '') ? null : $value;
            }
            $rows[] = $combinedRow;
        }

        return $rows;
    }

    private function readExcelWithSpreadsheet($file): array
    {
        $rows = [];
        $filePath = $file->getRealPath();

        // Try using PhpSpreadsheet
        if (class_exists('PhpOffice\PhpSpreadsheet\IOFactory')) {
            try {
                $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
                $worksheet = $spreadsheet->getActiveSheet();
                $data = $worksheet->toArray();

                if (empty($data)) {
                    throw new \Exception('Le fichier Excel est vide.');
                }

                $headers = array_map(fn ($h) => $this->convertToUtf8(trim((string) ($h ?? ''))), array_shift($data));

                foreach ($data as $row) {
                    if (!is_array($row)) {
                        continue;
                    }

                    $combinedRow = [];
                    foreach ($headers as $index => $header) {
                        $value = $row[$index] ?? null;
                        if (is_string($value)) {
                            $value = $this->convertToUtf8($value);
                        }
                        $combinedRow[$header] = (is_string($value) && $value === '') ? null : $value;
                    }
                    $rows[] = $combinedRow;
                }
            } catch (\Exception $e) {
                throw new \Exception('Erreur lors de la lecture du fichier Excel avec PhpSpreadsheet: ' . $e->getMessage());
            }
        } else {
            // Fallback: Try reading as CSV with different delimiters
            Log::warning('PhpSpreadsheet not available, attempting CSV parsing', [
                'file' => $file->getClientOriginalName(),
            ]);
            
            // For Excel files that can't be parsed, suggest CSV export
            throw new \Exception(
                'Les fichiers Excel (.xlsx, .xls) ne sont pas actuellement supportés. ' .
                'Veuillez exporter votre fichier en CSV (séparé par des virgules) et réessayer.'
            );
        }

        return $rows;
    }

    private function convertToUtf8($value)
    {
        if (!is_string($value)) {
            return $value;
        }

        if (mb_check_encoding($value, 'UTF-8')) {
            return trim($value);
        }

        $converted = @mb_convert_encoding($value, 'UTF-8', 'Windows-1252');
        if ($converted !== false && mb_check_encoding($converted, 'UTF-8')) {
            return trim($converted);
        }

        $converted = @mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
        return $converted !== false ? trim($converted) : trim($value);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        $ticket = Ticket::findOrFail($id);

        // Access control
        if ($role === 'user' && $ticket->id_utilisateur !== $user->id_utilisateur) {
            abort(403);
        }
        // Traiteurs can view all tickets, but actions are restricted in frontend and service

        return response()->json($this->loadTicketRelations($ticket));
    }

    public function prendreEnCharge(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->prendreEnCharge($ticket, $request->user()->id_utilisateur);

        return response()->json([
            'message' => 'Ticket pris en charge avec succès.',
            'ticket' => $this->loadTicketRelations($ticket),
        ]);
    }

    public function resoudre(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'typologie' => 'required|string|in:Incident,Demande',
            'id_categorie' => 'required|integer|exists:categorie,id_categorie',
            'id_sous_categorie' => 'required|integer|exists:sous_categorie,id',
            'impact' => 'required|string|in:pas_impact,impact_individuel,impact_general',
            'urgence' => 'required|string|in:urgent,non_urgent',
            'description' => 'required|string',
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->resoudreTicket($ticket, $request->user()->id_utilisateur, $request->only(['typologie', 'id_categorie', 'id_sous_categorie', 'impact', 'urgence', 'description']));

        return response()->json([
            'message' => 'Ticket résolu avec succès.',
            'ticket' => $this->loadTicketRelations($ticket),
        ]);
    }

    public function mettreEnAttente(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->mettreEnAttente($ticket, $request->user()->id_utilisateur);

        return response()->json([
            'message' => 'Ticket mis en attente.',
            'ticket' => $this->loadTicketRelations($ticket),
        ]);
    }

    public function reprendre(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->reprendreTicket($ticket, $request->user()->id_utilisateur);

        return response()->json([
            'message' => 'Ticket repris en charge.',
            'ticket' => $this->loadTicketRelations($ticket),
        ]);
    }

    public function valider(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->validerTicket($ticket);

        return response()->json([
            'message' => 'Ticket validé avec succès.',
            'ticket' => $ticket,
        ]);
    }

    public function rejeter(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->rejeterTicket($ticket);

        return response()->json([
            'message' => 'Ticket rejeté.',
            'ticket' => $ticket,
        ]);
    }

    public function confirmerCloture(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket = $this->ticketService->confirmerCloture($ticket, $request->user()->id_utilisateur);
        $ticket = $this->loadTicketRelations($ticket);

        return response()->json([
            'message' => 'Clôture du ticket confirmée avec succès.',
            'ticket' => $ticket,
        ]);
    }

    public function rouvrir(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $user   = $request->user()->load('role');
        $role   = $user->role?->nom_role;

        // Only traiteurs / admins can reopen
        if (!in_array($role, ['traiteur', 'admin'])) {
            abort(403, 'Seuls les traiteurs et les admins peuvent rouvrir un ticket.');
        }

        // Can only reopen if closed AND not yet confirmed by user
        if ($ticket->statut !== 'cloture') {
            return response()->json(['message' => 'Ce ticket n\'est pas clôturé.'], 422);
        }
        if ($ticket->confirme_par_utilisateur) {
            return response()->json(['message' => 'Ce ticket a déjà été confirmé par l\'utilisateur et ne peut pas être rouvert.'], 422);
        }

        $updateData = [
            'statut'                        => 'en_cours',
            'date_cloture'                  => null,
            'confirme_par_utilisateur'      => false,
            'date_confirmation_utilisateur' => null,
            'date_en_cours'                 => now(),
            'id_rapport'                    => null,  // cleared so 2nd closure creates a fresh rapport
        ];

        // Preserve previous closure into second-close slot if present
        if ($ticket->date_cloture && !$ticket->date_cloture_2) {
            try {
                $updateData['date_cloture_2'] = Carbon::parse($ticket->date_cloture)->toDateTimeString();
            } catch (\Exception $e) {
                $updateData['date_cloture_2'] = now()->toDateTimeString();
            }
        }

        // Record reopen date (second opening) with exact time if not already set
        if (!$ticket->date_ouverture_2) {
            $updateData['date_ouverture_2'] = now()->toDateTimeString();
        }

        $ticket->update($updateData);

        // Log into ticket history
        \App\Models\TicketHistorique::create([
            'id_ticket'   => $ticket->id_ticket,
            'id_user'     => $user->id_utilisateur,
            'action'      => 'REOUVERTURE',
            'commentaire' => 'Ticket rouvert par le traiteur — confirmation utilisateur en attente.',
            'created_at'  => now(),
        ]);

        return response()->json([
            'message' => 'Ticket rouvert avec succès.',
            'ticket'  => $this->loadTicketRelations($ticket),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        if ($role !== 'admin') {
            abort(403, 'Seuls les administrateurs peuvent modifier les tickets.');
        }

        $request->validate([
            'objet_ticket' => 'required|string|max:255',
            'description' => 'required|string',
            'priorite' => 'required|in:faible,moyenne,haute,critique',
            'id_categorie' => 'required|exists:categorie,id_categorie',
        ]);

        $ticket->update($request->only(['objet_ticket', 'description', 'priorite', 'id_categorie']));

        return response()->json([
            'message' => 'Ticket mis à jour avec succès.',
            'ticket' => $ticket->fresh(['utilisateur', 'categorie', 'traiteur', 'rapport']),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        if ($role !== 'admin') {
            abort(403, 'Seuls les administrateurs peuvent supprimer les tickets.');
        }

        // Supprimer les éléments liés avant de supprimer le ticket
        // 1. Supprimer l'historique du ticket
        $ticket->ticketHistoriques()->delete();

        // 2. Supprimer les demandes d'achat (déclarations niveau 2)
        $ticket->demandeAchats()->delete();

        // 3. Supprimer le rapport associé
        if ($ticket->rapport) {
            $ticket->rapport->delete();
        }

        // 4. Supprimer les logs d'email associés
        $ticket->emailLogs()->delete();

        // 5. Supprimer les actions du ticket
        $ticket->actions()->delete();

        // Enfin, supprimer le ticket
        $ticket->delete();

        return response()->json(['message' => 'Ticket et tous ses éléments associés supprimés avec succès.']);
    }

    public function statistiques(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

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

        $stats = [
            'total' => Ticket::count(),
            'ouvert' => (clone $query)->where('statut', 'ouvert')->count(),
            'en_cours' => (clone $query)->where('statut', 'en_cours')->count(),
            'en_attente' => (clone $query)->where('statut', 'en_attente')->count(),
            'cloture' => (clone $query)->where('statut', 'cloture')->count(),
            'critique' => (clone $query)->where('priorite', 'critique')->count(),
        ];

        return response()->json($stats);
    }

    public function statistiquesByTraiteur(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');
        $role = $user->role?->nom_role;

        if ($role !== 'traiteur' && $role !== 'admin') {
            abort(403, 'Seuls les traiteurs et admins peuvent accéder aux statistiques.');
        }

        $query = Ticket::query();

        if ($role === 'traiteur') {
            $query->where(function ($q) use ($user) {
                $q->where('id_traiteur', $user->id_utilisateur)
                  ->orWhere(function ($sub) {
                      $sub->whereNull('id_traiteur')->where('statut', 'ouvert');
                  });
            });
        }

        $stats = [
            'total' => (clone $query)->count(),
            'ouvert' => (clone $query)->where('statut', 'ouvert')->count(),
            'en_cours' => (clone $query)->whereIn('statut', ['en_cours', 'en_cour'])->count(),
            'en_attente' => (clone $query)->where('statut', 'en_attente')->count(),
            'cloture' => (clone $query)->where('statut', 'cloture')->count(),
        ];

        return response()->json($stats);
    }
}
