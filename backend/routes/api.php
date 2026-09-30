<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\DemandeAchatController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketActionController;
use Illuminate\Support\Facades\Route;

// ─── AUTH ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateMe']);
    });
});

// ─── DEBUG (Temporary) ────────────────────────────────────────────────
Route::post('/debug/import-preview', [\App\Http\Controllers\DebugController::class, 'importDebug']);

// ─── PROTECTED ROUTES ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Categories (all authenticated)
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/sous-categories', [CategorieController::class, 'sousCategories']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/statistiques', [TicketController::class, 'statistiques']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);

    // User: create ticket
    Route::middleware('role:user,admin,traiteur')->group(function () {
        Route::post('/tickets', [TicketController::class, 'store']);
        Route::patch('/tickets/{id}/confirmer-cloture', [TicketController::class, 'confirmerCloture']);
    });

    // Traiteur: take charge & resolve
    Route::middleware('role:traiteur,admin')->group(function () {
        Route::patch('/tickets/{id}/prendre-en-charge', [TicketController::class, 'prendreEnCharge']);
        Route::patch('/tickets/{id}/mettre-en-attente', [TicketController::class, 'mettreEnAttente']);
        Route::patch('/tickets/{id}/reprendre', [TicketController::class, 'reprendre']);
        Route::patch('/tickets/{id}/resoudre', [TicketController::class, 'resoudre']);
        Route::patch('/tickets/{id}/rouvrir', [TicketController::class, 'rouvrir']);
        Route::post('/demandes-achat', [DemandeAchatController::class, 'store']);
        Route::get('/contrats', [ContratController::class, 'index']);
        Route::post('/contrats', [ContratController::class, 'store']);
        Route::put('/contrats/{id}', [ContratController::class, 'update']);
        Route::delete('/contrats/{id}', [ContratController::class, 'destroy']);
    });

    // Validateur: validate or reject
    Route::middleware('role:validateur,admin')->group(function () {
        Route::patch('/tickets/{id}/valider', [TicketController::class, 'valider']);
        Route::patch('/tickets/{id}/rejeter', [TicketController::class, 'rejeter']);
        Route::get('/demandes-achat', [DemandeAchatController::class, 'index']);
        Route::patch('/demandes-achat/{id}/valider', [DemandeAchatController::class, 'valider']);
        Route::patch('/demandes-achat/{id}/refuser', [DemandeAchatController::class, 'refuser']);
        Route::delete('/demandes-achat/{id}', [DemandeAchatController::class, 'destroy']);
    });

    // Traiteur reports
    Route::middleware('role:traiteur')->group(function () {
        Route::get('/rapports', [AdminController::class, 'listeRapportsTraiteur']);
    });

    // Ticket Actions (Traiteur interface)
    Route::middleware('role:traiteur,admin')->prefix('tickets')->group(function () {
        Route::get('/traiteur/history', [TicketActionController::class, 'getTraiteurHistory']);
        Route::get('/traiteur/statistics', [TicketController::class, 'statistiquesByTraiteur']);
        Route::post('/{id}/mark-pending', [TicketActionController::class, 'markAsPending']);
        Route::post('/{id}/send-email', [TicketActionController::class, 'sendEmail']);
        Route::post('/{id}/resolve-immediate', [TicketActionController::class, 'resolveImmediate']);
        Route::post('/{id}/close', [TicketActionController::class, 'close']);
        Route::get('/{id}/history', [TicketActionController::class, 'getHistory']);
    });

    // Statistics
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/statistics/tickets', [TicketActionController::class, 'getStatistics']);
    });

    // Admin only
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Dashboard stats
        Route::get('/stats', [AdminController::class, 'statsGlobales']);
        Route::get('/kpi', [AdminController::class, 'kpiByMonth']);
        Route::get('/kpi-pro', [AdminController::class, 'kpiProfessionnel']);

        // Users CRUD
        Route::get('/utilisateurs', [AdminController::class, 'listeUtilisateurs']);
        Route::post('/utilisateurs', [AdminController::class, 'creerUtilisateur']);
        Route::put('/utilisateurs/{id}', [AdminController::class, 'modifierUtilisateur']);
        Route::patch('/utilisateurs/{id}/desactiver', [AdminController::class, 'desactiverUtilisateur']);
        Route::patch('/utilisateurs/{id}/activer', [AdminController::class, 'activerUtilisateur']);
        Route::delete('/utilisateurs/{id}', [AdminController::class, 'supprimerUtilisateur']);

        // Roles CRUD
        Route::get('/roles', [AdminController::class, 'listeRoles']);
        Route::post('/roles', [AdminController::class, 'creerRole']);
        Route::put('/roles/{id}', [AdminController::class, 'modifierRole']);
        Route::delete('/roles/{id}', [AdminController::class, 'supprimerRole']);

        // Categories CRUD
        Route::get('/categories', [AdminController::class, 'listeCategories']);
        Route::post('/categories', [AdminController::class, 'creerCategorie']);
        Route::put('/categories/{id}', [AdminController::class, 'modifierCategorie']);
        Route::delete('/categories/{id}', [AdminController::class, 'supprimerCategorie']);

        // Admin ticket management
        Route::put('/tickets/{id}', [TicketController::class, 'update']);
        Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);

        // Domaines traiteurs
        Route::get('/domaines-traiteurs', [AdminController::class, 'listeDomainesTraiteurs']);
        Route::put('/domaines-traiteurs/{id}', [AdminController::class, 'assignerCategoriesTraiteur']);

        // Rapports
        Route::get('/rapports', [AdminController::class, 'listeRapports']);
        Route::put('/rapports/{id}', [AdminController::class, 'modifierRapport']);
        Route::delete('/rapports/{id}', [AdminController::class, 'supprimerRapport']);

        // Import de tickets réels et actions de contrats
        Route::post('/tickets/import', [TicketController::class, 'import']);
        Route::delete('/contrats/clear', [ContratController::class, 'clearAll']);
    });
});
