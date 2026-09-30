<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Utilisateur;
use App\Models\Categorie;
use App\Models\SousCategorie;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class TicketImportController extends Controller
{
    public function importCsv(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,txt|max:10240'
            ]);

            $file = $request->file('file');
            $path = $file->getRealPath();
            $csv = array_map('str_getcsv', file($path));
            
            // Get headers (first row)
            $headers = array_map('trim', $csv[0]);
            
            // System user for auto-creator
            $systemUser = Utilisateur::where('email', 'system@system.com')
                ->orWhere('username', 'system')
                ->first();
            
            if (!$systemUser) {
                $systemUser = Utilisateur::first(); // Default to first user if system doesn't exist
            }

            $imported = 0;
            $errors = [];

            // Process each row (skip header)
            for ($i = 1; $i < count($csv); $i++) {
                try {
                    $row = array_combine($headers, array_map('trim', $csv[$i]));
                    
                    // Skip empty rows
                    if (empty($row['N° Ticket'])) {
                        continue;
                    }

                    // Map CSV columns to ticket fields
                    $numero_ticket = $row['N° Ticket'] ?? null;
                    $sujet = $row['Objet ticket'] ?? '';
                    $description = $row['Description'] ?? '';
                    $priorite = $this->mapPriorite($row['Priorité'] ?? 'normal');
                    $statut = $this->mapStatut($row['Statut'] ?? 'ouvert');
                    $date_creation = $this->parseDate($row['Date de création'] ?? null);
                    $date_cloture = $this->parseDate($row['date fermeture'] ?? null);
                    
                    // Get or create categorie
                    $categorie = Categorie::where('nom', $row['Catégorie'] ?? 'General')->first();
                    if (!$categorie) {
                        $categorie = Categorie::create(['nom' => $row['Catégorie'] ?? 'General']);
                    }

                    // Get or create sous_categorie
                    $sousCategorie = null;
                    if (!empty($row['sous-Catégorie'])) {
                        $sousCategorie = SousCategorie::where('nom', $row['sous-Catégorie'])
                            ->where('id_categorie', $categorie->id_categorie)
                            ->first();
                        if (!$sousCategorie) {
                            $sousCategorie = SousCategorie::create([
                                'nom' => $row['sous-Catégorie'],
                                'id_categorie' => $categorie->id_categorie
                            ]);
                        }
                    }

                    // Create ticket
                    $ticket = Ticket::create([
                        'numero_ticket' => $numero_ticket,
                        'sujet' => $sujet,
                        'description' => $description,
                        'priorite' => $priorite,
                        'statut' => $statut,
                        'id_utilisateur' => $systemUser->id_utilisateur,
                        'id_categorie' => $categorie->id_categorie,
                        'id_sous_categorie' => $sousCategorie ? $sousCategorie->id_sous_categorie : null,
                        'date_creation' => $date_creation,
                        'date_cloture' => $statut === 'cloture' ? $date_cloture : null,
                        'date_en_cours' => $statut === 'en_cours' ? $date_creation : null,
                    ]);

                    $imported++;

                } catch (\Exception $e) {
                    $errors[] = "Ligne " . ($i + 1) . ": " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'errors' => $errors,
                'message' => "$imported tickets importés avec succès"
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function parseDate($dateStr)
    {
        if (empty($dateStr)) {
            return null;
        }

        try {
            // Try DD/MM/YYYY HH:MM format
            if (strpos($dateStr, '/') !== false) {
                $parts = explode(' ', $dateStr);
                $datePart = $parts[0];
                $timePart = $parts[1] ?? '00:00';
                
                return Carbon::createFromFormat('d/m/Y H:i', $datePart . ' ' . $timePart, 'Africa/Casablanca')
                    ->setTimezone('UTC');
            }
            
            // Fallback to standard parsing
            return Carbon::parse($dateStr, 'Africa/Casablanca')->setTimezone('UTC');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function mapStatut($statut)
    {
        $mapping = [
            'CLÔTURÉ' => 'cloture',
            'CLOTURED' => 'cloture',
            'CLOTURE' => 'cloture',
            'EN COURS' => 'en_cours',
            'EN_COURS' => 'en_cours',
            'EN ATTENTE' => 'en_attente',
            'EN_ATTENTE' => 'en_attente',
            'OUVERT' => 'ouvert',
            'OPEN' => 'ouvert',
        ];

        $upper = strtoupper(trim($statut));
        return $mapping[$upper] ?? 'ouvert';
    }

    private function mapPriorite($priorite)
    {
        $mapping = [
            'HAUTE' => 'haute',
            'HIGH' => 'haute',
            'NORMAL' => 'normal',
            'MEDIUM' => 'normal',
            'BASSE' => 'basse',
            'LOW' => 'basse',
            'URGENT' => 'haute',
        ];

        $upper = strtoupper(trim($priorite));
        return $mapping[$upper] ?? 'normal';
    }
}
