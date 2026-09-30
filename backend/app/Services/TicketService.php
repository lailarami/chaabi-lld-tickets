<?php

namespace App\Services;

use App\Mail\TicketEnCoursMail;
use App\Mail\TicketResoluMail;
use App\Models\Categorie;
use App\Models\Contrat;
use App\Models\EmailLog;
use App\Models\Rapport;
use App\Models\Ticket;
use App\Models\TicketHistorique;
use App\Models\SousCategorie;
use App\Models\Role;
use App\Models\Utilisateur;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TicketService
{
    public function creerTicket(array $data, int $idUtilisateur): Ticket
    {
        $now = Carbon::now('Africa/Casablanca');

        $ticket = Ticket::create([
            'date_creation' => $now->toDateString(),
            'heure_creation' => $now->toTimeString(),
            'date_ouverture' => $now,
            'objet_ticket' => $data['objet_ticket'],
            'description' => $data['description'],
            'priorite' => $data['priorite'],
            'statut' => 'ouvert',
            'id_utilisateur' => $idUtilisateur,
            'id_categorie' => $data['id_categorie'] ?? null,
        ]);

        // Note: No automatic traiteur assignment - tickets are available to all traiteurs

        return $ticket->load(['utilisateur', 'categorie', 'traiteur']);
    }

    public function importTickets(array $rows, int $defaultUserId = null): array
    {
        $imported = [];
        $diagnostics = [];
        $now = Carbon::now('Africa/Casablanca');
        \Log::info('importTickets started', ['total_rows' => count($rows)]);

        foreach ($rows as $index => $row) {
            $rowDiag = ['index' => $index, 'reasons' => [], 'row_keys' => is_array($row) ? array_keys($row) : null, 'sample' => $row];

            if (!is_array($row)) {
                $rowDiag['reasons'][] = 'non_array_row';
                $diagnostics[] = $rowDiag;
                \Log::debug('Skipping non-array row', ['index' => $index]);
                continue;
            }

            // Normalize row values and keys for reliable matching
            $row = array_map(fn ($value) => $this->normalizeEncoding($value), $row);

            $normalizedRow = [];
            foreach ($row as $key => $value) {
                $normalizedRow[$this->normalizeKey($key)] = $value;
            }
            $row = $normalizedRow;
            
            $normalize = fn ($keys) => $this->normalizeValue(
                $row[$this->normalizeKey($keys)] ?? null
            );
            $raw = fn ($keys) => $row[$this->normalizeKey($keys)] ?? null;

            // Try multiple common column names for objet and description
            $objet = $normalize('objet_ticket') 
                ?? $normalize('objet') 
                ?? $normalize('titre')
                ?? $normalize('subject')
                ?? $normalize('object');
                
            $description = $normalize('description') 
                ?? $normalize('description_ticket')
                ?? $normalize('desc') 
                ?? $normalize('contenu');

            if (!$objet || !$description) {
                $rowDiag['reasons'][] = 'missing_objet_or_description';
                $rowDiag['details'] = ['objet' => $objet, 'description' => $description];
                $diagnostics[] = $rowDiag;
                \Log::debug('Skipping row: missing objet or description', [
                    'index' => $index,
                    'objet' => $objet,
                    'description' => $description,
                    'row_keys' => array_keys($row),
                ]);
                continue;
            }

            // Parse date and time from "Date de création"
            $dateCreationStr = $raw('date_creation') ?? $raw('date_de_creation') ?? $raw('date');
            $dateCreation = null;
            $heureCreation = null;
            if ($dateCreationStr) {
                $parsedDateTime = $this->parseDateTime($dateCreationStr);
                if ($parsedDateTime) {
                    $dateCreation = substr($parsedDateTime, 0, 10);
                    $heureCreation = substr($parsedDateTime, 11);
                } else {
                    try {
                        $parsed = Carbon::parse($dateCreationStr);
                        $dateCreation = $parsed->toDateString();
                        $heureCreation = $parsed->toTimeString();
                    } catch (\Exception $e) {
                        \Log::warning('Failed to parse date_creation', ['value' => $dateCreationStr, 'error' => $e->getMessage()]);
                    }
                }
            }

            // Normalize statut
            $statutRaw = $normalize('statut') ?? $normalize('status') ?? 'ouvert';
            $statut = $this->normalizeStatut($statutRaw);
            \Log::info('Statut détecté', [
                'index' => $index,
                'original' => $statutRaw,
                'normalized' => $statut,
            ]);

            // Normalize priorite
            $prioriteRaw = $normalize('priorite') ?? $normalize('priorité') ?? $normalize('priority') ?? 'moyenne';
            $priorite = $this->normalizePriorite($prioriteRaw);

            // Normalize impact
            $impactRaw = $normalize('impact') ?? 'pas_impact';
            $impact = $this->normalizeImpact($impactRaw);

            // Resolve user IDs
            $createurTicket = $normalize('createur_ticket') ?? $normalize('créateur_ticket') ?? $normalize('creator');
            $ticketTraitePar = $normalize('ticket_traite_par') ?? $normalize('ticket_traité_par') ?? $normalize('handler');

            $idUtilisateur = $this->resolveUtilisateurId(
                $normalize('id_utilisateur') ?? $normalize('user_id'),
                $normalize('utilisateur_email') ?? $normalize('user_email') ?? $normalize('email'),
                $createurTicket, // Try to resolve by name
                null
            );
            if (!$idUtilisateur) {
                $idUtilisateur = $this->resolveSystemUserId();
            }

            $idTraiteur = $this->resolveUtilisateurId(
                $normalize('id_traiteur') ?? $normalize('handler_id'),
                null, // No email for handler
                $ticketTraitePar, // Try to resolve by name
                null
            );

            \Log::info('Closed ticket resolver values', [
                'index' => $index,
                'ticketTraitePar' => $ticketTraitePar,
                'idTraiteur' => $idTraiteur,
            ]);

            // Resolve category and subcategory by name
            $categorieNom = $normalize('categorie') ?? $normalize('category');
            $sousCategorieNom = $normalize('sous_categorie') ?? $normalize('sous_catégorie') ?? $normalize('sub_category');

            $idCategorie = $this->resolveCategorieId($categorieNom);
            $idSousCategorie = $this->resolveSousCategorieId($sousCategorieNom);

            if ($statut === 'cloture') {
                if (!$idCategorie) {
                    $rowDiag['reasons'][] = 'closed_missing_categorie';
                    $diagnostics[] = $rowDiag;
                    \Log::warning('Skipping closed ticket import: categorie manquante', [
                        'index' => $index,
                        'objet' => $objet,
                        'statut' => $statut,
                        'row' => $row,
                    ]);
                    continue;
                }

                if (!$idTraiteur) {
                    $rowDiag['reasons'][] = 'closed_missing_traiteur';
                    $rowDiag['details'] = ['handler' => $ticketTraitePar];
                    $diagnostics[] = $rowDiag;
                    \Log::warning('Skipping closed ticket import: traiteur manquant', [
                        'index' => $index,
                        'objet' => $objet,
                        'statut' => $statut,
                        'handler' => $ticketTraitePar,
                        'row' => $row,
                    ]);
                    continue;
                }
            }

            if ($statut === 'ouvert') {
                $idTraiteur = null;
            }

            $ticketData = [
                'date_creation' => $dateCreation ?? $now->toDateString(),
                'heure_creation' => $heureCreation ?? $now->toTimeString(),
                'date_ouverture' => $this->parseDate($raw('date_ouverture')) ?: $dateCreation ?? $now->toDateTimeString(),
                'date_cloture' => $this->parseDateTime(
                    $raw('date_cloture')
                    ?? $raw('date_de_cloture')
                    ?? $raw('date_fermeture')
                    ?? $raw('date_de_fermeture')
                ),
                'objet_ticket' => $objet,
                'description' => $description,
                'priorite' => $priorite,
                'statut' => $statut,
                'id_utilisateur' => $idUtilisateur,
                'id_categorie' => $idCategorie,
                'id_sous_categorie' => $idSousCategorie,
                'impact' => $impact,
                'typologie' => $normalize('typologie') ?? $normalize('typologie_ticket') ?? $normalize('type') ?? $normalize('type_ticket'),
                'id_rapport' => $this->parseInteger($normalize('id_rapport') ?? $normalize('report_id')),
                'id_traiteur' => $idTraiteur,
                'traite_par' => $idTraiteur,
                'notes_traiteur' => $normalize('notes_traiteur') ?? $normalize('notes'),
                'date_en_cours' => $this->parseDateTime($raw('date_en_cours')),
                'date_en_attente' => $this->parseDateTime($raw('date_en_attente')),
                'date_confirmation_utilisateur' => $this->parseDateTime($raw('date_confirmation_utilisateur')),
            ];

            if (!empty($ticketData['date_cloture'])) {
                $ticketData['statut'] = 'cloture';
            }

            if ($ticketData['statut'] === 'cloture') {
                $ticketData['date_cloture'] = $ticketData['date_cloture'] ?? $now->toDateTimeString();
                $ticketData['date_en_cours'] = $ticketData['date_en_cours'] ?? $now->toDateTimeString();
            }

            \Log::info('Ticket import data', [
                'index' => $index,
                'statut' => $ticketData['statut'],
                'id_traiteur' => $ticketData['id_traiteur'],
                'traite_par' => $ticketData['traite_par'],
                'row' => $row,
            ]);

            try {
                $ticket = Ticket::create($ticketData);
                $imported[] = $ticket;
                $rowDiag['imported'] = true;
                $diagnostics[] = $rowDiag;
                \Log::info('Ticket imported', ['id' => $ticket->id_ticket, 'objet' => $objet]);
            } catch (\Exception $e) {
                $rowDiag['reasons'][] = 'create_failed';
                $rowDiag['details'] = ['error' => $e->getMessage(), 'data' => $ticketData];
                $diagnostics[] = $rowDiag;
                \Log::error('Failed to create ticket', [
                    'index' => $index,
                    'error' => $e->getMessage(),
                    'data' => $ticketData,
                ]);
            }
        }

        \Log::info('importTickets completed', ['imported' => count($imported), 'total' => count($rows), 'diagnostics_count' => count($diagnostics)]);
        return ['imported' => $imported, 'diagnostics' => $diagnostics];
    }

    private function normalizeValue($value)
    {
        if (is_null($value)) {
            return null;
        }

        $value = $this->normalizeString((string) $value);
        return $value === '' ? null : $value;
    }

    private function normalizeEncoding($value)
    {
        if (is_null($value) || !is_string($value)) {
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

    private function normalizeString(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (!mb_check_encoding($value, 'UTF-8')) {
            $value = $this->normalizeEncoding($value);
        }

        return $value;
    }

    private function removeAccents(string $value): string
    {
        $map = [
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a',
            'æ' => 'ae', 'ç' => 'c', 'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ñ' => 'n', 'ò' => 'o',
            'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'œ' => 'oe', 'ù' => 'u',
            'ú' => 'u', 'û' => 'u', 'ü' => 'u', 'ý' => 'y', 'ÿ' => 'y', 'ß' => 'ss',
            'À' => 'a', 'Á' => 'a', 'Â' => 'a', 'Ã' => 'a', 'Ä' => 'a', 'Å' => 'a',
            'Æ' => 'ae', 'Ç' => 'c', 'È' => 'e', 'É' => 'e', 'Ê' => 'e', 'Ë' => 'e',
            'Ì' => 'i', 'Í' => 'i', 'Î' => 'i', 'Ï' => 'i', 'Ñ' => 'n', 'Ò' => 'o',
            'Ó' => 'o', 'Ô' => 'o', 'Õ' => 'o', 'Ö' => 'o', 'Œ' => 'oe', 'Ù' => 'u',
            'Ú' => 'u', 'Û' => 'u', 'Ü' => 'u', 'Ý' => 'y', 'Ÿ' => 'y',
        ];

        return strtr($value, $map);
    }

    private function normalizeKey(string $key): string
    {
        $normalized = mb_strtolower(trim($key));

        $normalized = str_replace(
            ['à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'œ', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', 'ß'],
            ['a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n', 'o', 'o', 'o', 'o', 'o', 'oe', 'u', 'u', 'u', 'u', 'y', 'y', 'ss'],
            $normalized
        );

        if (function_exists('transliterator_transliterate')) {
            $transliterated = transliterator_transliterate('Any-Latin; Latin-ASCII', $normalized);
            if ($transliterated !== false) {
                $normalized = $transliterated;
            }
        } elseif (function_exists('iconv')) {
            $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT', $normalized);
            if ($transliterated !== false) {
                $normalized = $transliterated;
            }
        }

        // Remove any remaining combining marks and normalize separators
        $normalized = preg_replace('/[\p{M}]+/u', '', $normalized);
        $normalized = str_replace(['°', 'º'], '', $normalized);
        $normalized = preg_replace('#[\s\-()\[\]{}\\/]+#u', '_', $normalized);
        $normalized = preg_replace('#[^\p{L}\p{N}_]+#u', '_', $normalized);
        $normalized = preg_replace('#_+#', '_', $normalized);
        return trim($normalized, '_');
    }

    private function parseInteger($value): ?int
    {
        if ($value === null) {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function parseDate($value): ?string
    {
        if (!$value) {
            return null;
        }

        $value = trim((string) $value);
        $value = preg_replace('/\s+/', ' ', $value);

        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d H:i',
            'd/m/Y H:i:s',
            'd/m/Y H:i',
            'd/m/Y',
            'Y-m-d',
            'm/d/Y',
            'm/d/Y H:i',
        ];

        foreach ($formats as $format) {
            try {
                $parsed = Carbon::createFromFormat($format, $value);
                if ($parsed !== false) {
                    return $parsed->toDateString();
                }
            } catch (\Exception $e) {
                // ignore bad format and continue
            }
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseDateTime($value): ?string
    {
        if (!$value) {
            return null;
        }

        $value = trim((string) $value);
        $value = preg_replace('/\s+/', ' ', $value);
        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d H:i',
            'd/m/Y H:i:s',
            'd/m/Y H:i',
            'd/m/Y',
            'Y-m-d',
            'm/d/Y H:i',
            'm/d/Y',
        ];

        foreach ($formats as $format) {
            try {
                $parsed = Carbon::createFromFormat($format, $value);
                if ($parsed !== false) {
                    return $parsed->toDateTimeString();
                }
            } catch (\Exception $e) {
                // ignore bad format and continue
            }
        }

        try {
            return Carbon::parse($value)->toDateTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseTime($value): ?string
    {
        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value)->toTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    private function resolveUtilisateurId($idUtilisateur, $email, $nom = null, $defaultUserId = null): ?int
    {
        if ($this->parseInteger($idUtilisateur)) {
            return $this->parseInteger($idUtilisateur);
        }

        if ($email) {
            $utilisateur = Utilisateur::where('email', $email)->first();
            if ($utilisateur) {
                return $utilisateur->id_utilisateur;
            }
        }

        if ($nom) {
            $nom = $this->normalizeString((string) $nom);
            // Try to find by name - look for exact match first, then partial
            $utilisateur = Utilisateur::where('nom', $nom)->first();
            if (!$utilisateur) {
                // Try case-insensitive match
                $utilisateur = Utilisateur::whereRaw('LOWER(nom) = ?', [strtolower($nom)])->first();
            }
            if (!$utilisateur && str_contains($nom, ' ')) {
                // Try matching part of the name
                $nameParts = explode(' ', $nom);
                $utilisateur = Utilisateur::where(function ($query) use ($nameParts) {
                    foreach ($nameParts as $part) {
                        $query->orWhere('nom', 'like', "%{$part}%");
                    }
                })->first();
            }
            if ($utilisateur) {
                return $utilisateur->id_utilisateur;
            }
        }

        return $defaultUserId;
    }

    private function resolveCategorieId($nom): ?int
    {
        if (!$nom) {
            return null;
        }

        $nom = $this->normalizeString((string) $nom);
        if ($nom === '') {
            return null;
        }

        $categorie = Categorie::where('nom', $nom)->first();
        if (!$categorie) {
            $categorie = Categorie::whereRaw('LOWER(nom) = ?', [mb_strtolower($nom)])->first();
        }

        if (!$categorie) {
            $lookup = $this->normalizeKey($nom);
            $fallbacks = [
                'materiel' => 'MATERIEL info',
                'materiel_info' => 'MATERIEL info',
                'base_de_donnees' => 'BASE DE DONNEES',
                'reseau' => 'RÉSEAU et connexion',
                'messagerie' => 'MESSAGERIE',
                'internet' => 'INTERNET',
                'active_directory' => 'ACTIVE DIRECTORY',
                'logiciel' => 'LOGICIEL',
                'infrastructure_it' => 'INFRASTRUCTURE IT',
                'securite' => 'SECURITE IT',
                'cisco' => 'Cisco et telephonie',
                'portail_web' => 'PORTAIL WEB',
                'accessoir_informatique' => 'ACCESSOIR INFORMATIQUE',
            ];

            foreach ($fallbacks as $contains => $fallbackName) {
                if (str_contains($lookup, $contains)) {
                    $categorie = Categorie::firstOrCreate(['nom' => $fallbackName]);
                    break;
                }
            }
        }

        if (!$categorie) {
            $categorie = Categorie::firstOrCreate(['nom' => $nom]);
            \Log::info('Created new categorie for import', ['nom' => $nom, 'id' => $categorie->id_categorie]);
        }

        return $categorie->id_categorie;
    }

    private function resolveSystemUserId(): ?int
    {
        $systemUser = Utilisateur::whereIn('nom', ['Systeme', 'Système', 'System'])->orWhere('email', 'system@chaabilld.ma')->first();
        if ($systemUser) {
            return $systemUser->id_utilisateur;
        }

        $userRole = Role::where('nom_role', 'user')->first();
        $nouveauUtilisateur = Utilisateur::create([
            'nom' => 'Systeme',
            'email' => 'system@chaabilld.ma',
            'password' => Hash::make(Str::random(32)),
            'id_role' => $userRole?->id_role ?? 1,
        ]);

        return $nouveauUtilisateur->id_utilisateur;
    }

    private function resolveSousCategorieId($nom): ?int
    {
        if (!$nom) {
            return null;
        }

        $nom = $this->normalizeString((string) $nom);
        if ($nom === '') {
            return null;
        }

        $sousCategorie = SousCategorie::where('nom', $nom)->first();
        if (!$sousCategorie) {
            $sousCategorie = SousCategorie::whereRaw('LOWER(nom) = ?', [mb_strtolower($nom)])->first();
        }

        if (!$sousCategorie) {
            $sousCategorie = SousCategorie::firstOrCreate(['nom' => $nom]);
            \Log::info('Created new sous-categorie for import', ['nom' => $nom, 'id' => $sousCategorie->id]);
        }

        return $sousCategorie->id;
    }

    private function normalizeStatut($value): string
    {
        $value = $this->normalizeString((string) $value);
        $value = $this->removeAccents($value);
        $value = strtolower($value);

        $ascii = $value;
        if (function_exists('transliterator_transliterate')) {
            $transliterated = transliterator_transliterate('Any-Latin; Latin-ASCII', $ascii);
            if ($transliterated !== false) {
                $ascii = $transliterated;
            }
        } elseif (function_exists('iconv')) {
            $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT', $ascii);
            if ($transliterated !== false) {
                $ascii = $transliterated;
            }
        }

        $ascii = preg_replace('/[^a-z0-9 ]+/', ' ', $ascii);
        $ascii = trim(preg_replace('/\s+/', ' ', $ascii));

        if ($ascii === '') {
            return 'ouvert';
        }

        if (str_contains($ascii, 'clot')
            || str_contains($ascii, 'ferme')
            || str_contains($ascii, 'resol')
            || str_contains($ascii, 'valid')
            || str_contains($ascii, 'rej')) {
            return 'cloture';
        }

        if (str_contains($ascii, 'en cours')
            || str_contains($ascii, 'encours')
            || str_contains($ascii, 'en cour')
            || str_contains($ascii, 'cours')) {
            return 'en_cours';
        }

        if (str_contains($ascii, 'en attente')
            || str_contains($ascii, 'attente')) {
            return 'en_attente';
        }

        if (str_contains($ascii, 'ouvert')
            || str_contains($ascii, 'open')
            || str_contains($ascii, 'nouveau')
            || str_contains($ascii, 'new')
            || str_contains($ascii, 'cree')
            || str_contains($ascii, 'create')) {
            return 'ouvert';
        }

        return 'ouvert';
    }

    private function normalizePriorite($value): string
    {
        $value = $this->normalizeString((string) $value);
        $value = strtolower($value);
        
        $mappings = [
            'faible' => 'faible',
            'low' => 'faible',
            'moyenne' => 'moyenne',
            'medium' => 'moyenne',
            'haute' => 'haute',
            'high' => 'haute',
            'critique' => 'critique',
            'critical' => 'critique',
            'urgent' => 'critique',
        ];

        return $mappings[$value] ?? 'moyenne';
    }

    private function normalizeImpact($value): string
    {
        $value = $this->normalizeString((string) $value);
        $value = strtolower($value);
        $value = $this->removeAccents($value);
        $clean = iconv('UTF-8', 'ASCII//TRANSLIT', $value);
        $clean = $clean !== false ? $clean : $value;
        $clean = preg_replace('/[^a-z0-9]+/', '_', $clean);
        $clean = trim($clean, '_');

        if ($clean === '' || str_contains($clean, 'pas') && str_contains($clean, 'impact')) {
            return 'pas_impact';
        }

        if (str_contains($clean, 'impactindividuel') || str_contains($clean, 'individualimpact')) {
            return 'impact_individuel';
        }

        if (str_contains($clean, 'impactgeneral') || str_contains($clean, 'generalimpact') || str_contains($clean, 'impactgener')) {
            return 'impact_general';
        }

        if (str_contains($clean, 'pas') && !str_contains($clean, 'impact')) {
            return 'pas_impact';
        }

        return 'pas_impact';
    }

    private function parseDateTimeValue($value): ?string
    {
        return $this->parseDateTime($value);
    }

    public function prendreEnCharge(Ticket $ticket, int $traiteurId, string $message = null): Ticket
    {
        if (!in_array($ticket->statut, ['ouvert', 'en_attente'])) {
            abort(422, 'Le ticket ne peut pas être pris en charge dans son état actuel.');
        }

        $now = Carbon::now('Africa/Casablanca');

        $ticket->update([
            'statut' => 'en_cours',
            'date_ouverture' => $now->toDateTimeString(),
            'date_en_cours' => $now,
            'id_traiteur' => $traiteurId,
            'traite_par' => $traiteurId,
        ]);

        // Record action in ticket_historique
        TicketHistorique::create([
            'id_ticket' => $ticket->id_ticket,
            'id_user' => $traiteurId,
            'action' => 'Ticket pris en charge',
            'commentaire' => "Le traiteur a pris en charge le ticket.",
            'created_at' => $now,
        ]);

        // Send email to ticket creator via mail-service
        $ticket->load(['utilisateur', 'categorie', 'traiteur']);
        try {
            $emailSent = MailService::sendEmail(
                $ticket->utilisateur->email,
                "Votre ticket #{$ticket->id_ticket} est en cours de traitement",
                $message ?: "Votre ticket #{$ticket->id_ticket} a été pris en charge par notre équipe technique. Vous serez informé dès que la résolution sera effectuée."
            );

            // Log the email
            EmailLog::create([
                'id_ticket' => $ticket->id_ticket,
                'destinataire' => $ticket->utilisateur->email,
                'sujet' => "Votre ticket est en cours de traitement",
                'contenu' => $message ?: "Votre ticket #{$ticket->id_ticket} a été pris en charge par notre équipe technique. Vous serez informé dès que la résolution sera effectuée.",
                'statut' => $emailSent ? 'sent' : 'failed',
            ]);
        } catch (\Exception $e) {
            \Log::error('Email prise en charge échoué: ' . $e->getMessage());
        }

        return $ticket;
    }

    public function resoudreTicket(Ticket $ticket, int $traiteurId, array $formData = []): Ticket
    {
        // Charger l'utilisateur créateur du ticket
        $ticket->load(['utilisateur', 'utilisateur.role']);
        $creatorRole = $ticket->utilisateur?->role?->nom_role;

        // Déterminer l'autorisation
        // Si le ticket est créé par un traiteur (ticket de traiteur), n'importe quel traiteur peut le résoudre
        if ($creatorRole === 'traiteur') {
            $isAuthorized = true;
        } else {
            // Sinon, seul le traiteur qui a pris en charge ou qui a été assigné peut résoudre
            $isAuthorized = ($ticket->traite_par === $traiteurId)
                || ($ticket->id_traiteur === $traiteurId)
                || ($ticket->id_traiteur === null && $ticket->traite_par === null);
        }

        if (!$isAuthorized) {
            abort(403, 'Vous n\'avez pas le droit de résoudre ce ticket.');
        }

        if (!in_array($ticket->statut, ['en_cours', 'en_cour'], true) && $ticket->statut !== 'en_attente' && $ticket->statut !== 'ouvert') {
            abort(422, 'Le ticket doit être en cours, en attente ou ouvert pour être clôturé.');
        }

        // Define valid impacts
        $validImpacts = ['pas_impact', 'impact_individuel', 'impact_general'];

        // Validate required fields from form data
        $missingFields = [];
        if (empty($formData['typologie'])) {
            $missingFields[] = 'Typologie';
        }
        if (empty($formData['id_categorie'])) {
            $missingFields[] = 'Catégorie';
        }
        if (empty($formData['id_sous_categorie'])) {
            $missingFields[] = 'Sous-catégorie';
        }
        if (empty($formData['impact'])) {
            $missingFields[] = 'Impact';
        }
        if (empty($formData['description'])) {
            $missingFields[] = 'Description';
        }

        if (!empty($missingFields)) {
            abort(422, 'Impossible de clôturer le ticket. Champs manquants: ' . implode(', ', $missingFields));
        }

        // Validate categorie exists in database
        $categorie = \App\Models\Categorie::find($formData['id_categorie']);
        if (!$categorie) {
            abort(422, 'Catégorie invalide ou non trouvée.');
        }

        // Validate sous-categorie exists in database
        $sousCategorie = \App\Models\SousCategorie::find($formData['id_sous_categorie']);
        if (!$sousCategorie) {
            abort(422, 'Sous-catégorie invalide ou non trouvée.');
        }

        if (!in_array($formData['impact'], $validImpacts)) {
            abort(422, 'Impact invalide.');
        }

        $validUrgences = ['urgent', 'non_urgent'];
        if (!in_array($formData['urgence'], $validUrgences)) {
            abort(422, 'Urgence invalide.');
        }

        $now = Carbon::now('Africa/Casablanca');

        $ticketUpdateData = [
            'id_categorie' => $formData['id_categorie'],
            'typologie' => $formData['typologie'],
            'id_sous_categorie' => $sousCategorie->id,
            'impact' => $formData['impact'],
            'urgence' => $formData['urgence'],
            'description' => $formData['description'],
            'statut' => 'cloture',
            'date_cloture' => $now->toDateTimeString(),
        ];

        if ($ticket->id_traiteur === null && $ticket->traite_par === null) {
            $ticketUpdateData['id_traiteur'] = $traiteurId;
            $ticketUpdateData['traite_par'] = $traiteurId;
                $ticketUpdateData['date_ouverture'] = $now->toDateTimeString();
        }

        $ticket->update($ticketUpdateData);

        // Refresh from DB so we can see any values set earlier (e.g., date_ouverture_2 during reopen)
        $ticket->refresh();

        // If this is the second closure, record it in date_cloture_2 with exact time
        if (!empty($ticket->date_ouverture_2) && empty($ticket->date_cloture_2)) {
            $ticket->update(['date_cloture_2' => $now->toDateTimeString()]);
            $ticket->refresh();
        }

        // Build history commentaire, include second open/close if present
        $reopenPart = '';
        if (!empty($ticket->date_ouverture_2)) {
            $reopenPart = ' | Réouverture: ' . Carbon::parse($ticket->date_ouverture_2)->format('d/m/Y H:i');
            if (!empty($ticket->date_cloture_2)) {
                $reopenPart .= ' - Reclôturé: ' . Carbon::parse($ticket->date_cloture_2)->format('d/m/Y H:i');
            }
        }

        // Write a rich history entry including date_cloture and optional reopen info
        TicketHistorique::create([
            'id_ticket'   => $ticket->id_ticket,
            'id_user'     => $traiteurId,
            'action'      => 'Ticket clôturé',
            'commentaire' => sprintf(
                'Clôturé le %s%s | Typologie: %s | Sous-catégorie: %s | Impact: %s | Solution: %s',
                $now->format('d/m/Y H:i'),
                $reopenPart,
                $formData['typologie'],
                $sousCategorie->nom,
                $formData['impact'],
                mb_substr($formData['description'], 0, 200)
            ),
            'created_at'  => $now,
        ]);

        // Generate rapport
        $rapport = Rapport::create([
            'date_generation' => $now->toDateTimeString(),
            'date_fermeture' => $now->toDateTimeString(),
            'description' => "Rapport de clôture - Ticket #{$ticket->id_ticket}: {$ticket->objet_ticket}",
            'id_sous_categorie' => $sousCategorie->id,
            'typologie' => $formData['typologie'],
            'impact' => $formData['impact'],
            'notes_traiteur' => $formData['description'],
        ]);

        $ticket->update(['id_rapport' => $rapport->id_rapport]);

        $ticket->load(['utilisateur', 'categorie', 'traiteur', 'rapport', 'sousCategorie']);
        try {
            $emailSent = MailService::sendEmail(
                $ticket->utilisateur->email,
                "Votre ticket #{$ticket->id_ticket} est clôturé",
                "Votre ticket #{$ticket->id_ticket} a été clôturé avec succès.\n\nRésolution: {$formData['description']}\n\nMerci d'avoir utilisé notre service de support."
            );

            // Log the email
            EmailLog::create([
                'id_ticket' => $ticket->id_ticket,
                'destinataire' => $ticket->utilisateur->email,
                'sujet' => "Votre ticket est clôturé",
                'contenu' => "Votre ticket #{$ticket->id_ticket} a été clôturé avec succès. Résolution: {$formData['description']}",
                'statut' => $emailSent ? 'sent' : 'failed',
            ]);
        } catch (\Exception $e) {
            \Log::error('Email clôture échoué: ' . $e->getMessage());
        }

        return $ticket->fresh(['utilisateur', 'categorie', 'traiteur', 'rapport', 'sousCategorie']);
    }

    public function mettreEnAttente(Ticket $ticket, int $traiteurId): Ticket
    {
        $isAuthorized = ($ticket->traite_par === $traiteurId) || ($ticket->id_traiteur === $traiteurId);
        if (!$isAuthorized) {
            abort(403, 'Ce ticket ne vous est pas assigné.');
        }

        if (!in_array($ticket->statut, ['en_cours', 'en_cour'], true)) {
            abort(422, 'Le ticket doit être en cours pour être mis en attente.');
        }

        $ticket->update(['statut' => 'en_attente', 'date_en_attente' => Carbon::now('Africa/Casablanca')]);

        // Record action in ticket_historique
        TicketHistorique::create([
            'id_ticket' => $ticket->id_ticket,
            'id_user' => $traiteurId,
            'action' => 'Ticket mis en attente',
            'commentaire' => "Le traiteur a mis le ticket en attente.",
            'created_at' => Carbon::now('Africa/Casablanca'),
        ]);

        return $ticket->fresh(['utilisateur', 'categorie', 'traiteur', 'rapport', 'sousCategorie']);
    }

    public function reprendreTicket(Ticket $ticket, int $traiteurId): Ticket
    {
        $isAuthorized = ($ticket->traite_par === $traiteurId) || ($ticket->id_traiteur === $traiteurId);
        if (!$isAuthorized) {
            abort(403, 'Ce ticket ne vous est pas assigné.');
        }

        if ($ticket->statut !== 'en_attente') {
            abort(422, 'Le ticket doit être en attente pour être repris.');
        }

        $ticket->update(['statut' => 'en_cours', 'date_en_cours' => Carbon::now('Africa/Casablanca')]);

        // Record action in ticket_historique
        TicketHistorique::create([
            'id_ticket' => $ticket->id_ticket,
            'id_user' => $traiteurId,
            'action' => 'Ticket repris en charge',
            'commentaire' => "Le traiteur a repris le ticket en charge.",
            'created_at' => Carbon::now('Africa/Casablanca'),
        ]);

        return $ticket->fresh(['utilisateur', 'categorie', 'traiteur', 'rapport', 'sousCategorie']);
    }

    public function validerTicket(Ticket $ticket): Ticket
    {
        if ($ticket->statut !== 'cloture') {
            abort(422, 'Le ticket doit être clôturé pour être validé.');
        }

        $ticket->update(['statut' => 'cloture']);

        return $ticket;
    }

    public function rejeterTicket(Ticket $ticket): Ticket
    {
        if ($ticket->statut !== 'cloture') {
            abort(422, 'Le ticket doit être clôturé pour être rejeté.');
        }

        $ticket->update(['statut' => 'cloture']);

        return $ticket;
    }

    public function confirmerCloture(Ticket $ticket, int $utilisateurId): Ticket
    {
        if ($ticket->id_utilisateur !== $utilisateurId) {
            abort(403, 'Vous ne pouvez confirmer que vos propres tickets.');
        }

        if ($ticket->statut !== 'cloture') {
            abort(422, 'Le ticket doit être clôturé pour confirmer sa clôture.');
        }

        if ($ticket->confirme_par_utilisateur) {
            abort(422, 'Ce ticket a déjà été confirmé.');
        }

        $ticket->update([
            'confirme_par_utilisateur' => true,
            'date_confirmation_utilisateur' => Carbon::now('Africa/Casablanca'),
        ]);

        return $ticket;
    }

    public function marquerEnAttente(Ticket $ticket, int $traiteurId, string $description = null): Ticket
    {
        if ($ticket->id_traiteur !== $traiteurId) {
            abort(403, 'Ce ticket ne vous est pas assigné.');
        }

        if ($ticket->statut !== 'en_cours') {
            abort(422, 'Le ticket doit être en cours pour être marqué en attente.');
        }

        $now = Carbon::now();

        $ticket->update([
            'statut' => 'en_attente',
            'notes_traiteur' => $description,
        ]);

        // Record action in ticket_historique
        TicketHistorique::create([
            'id_ticket' => $ticket->id_ticket,
            'id_user' => $traiteurId,
            'action' => 'Ticket marqué en attente',
            'commentaire' => $description ?? 'En attente d\'une action externe.',
            'created_at' => $now,
        ]);

        return $ticket->load(['utilisateur', 'categorie', 'traiteur']);
    }
}
