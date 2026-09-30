<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $table = 'ticket';
    protected $primaryKey = 'id_ticket';

    protected $fillable = [
        'id_ticket',
        'date_creation',
        'heure_creation',
        'date_ouverture',
        'date_cloture',
        'objet_ticket',
        'statut',
        'priorite',
        'description',
        'id_utilisateur',
        'id_categorie',
        'id_rapport',
        'id_traiteur',
        'traite_par',
        'type_action',
        'niveau',
        'notes_traiteur',
        'typologie',
        'numero_ticket',
        'id_sous_categorie',
        'impact',
        'urgence',
        'solution',
        'confirme_par_utilisateur',
        'date_confirmation_utilisateur',
        'date_en_cours',
        'date_en_attente',
        'date_ouvert',
        'date_ouverture_2',
        'date_cloture_2',
    ];

    protected $casts = [
        'date_creation' => 'date',
        'date_ouverture' => 'datetime',
        'date_cloture' => 'datetime',
        'date_confirmation_utilisateur' => 'datetime',
        'date_en_cours' => 'datetime',
        'date_en_attente' => 'datetime',
        'date_ouvert' => 'datetime',
        'date_ouverture_2' => 'datetime',
        'date_cloture_2' => 'datetime',
        'confirme_par_utilisateur' => 'boolean',
    ];

    protected $appends = ['sous_categorie_nom'];

    public function getSousCategorieNomAttribute()
    {
        return $this->sousCategorie?->nom ?? null;
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function traiteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_traiteur', 'id_utilisateur');
    }

    public function traiteurActuel()
    {
        return $this->belongsTo(Utilisateur::class, 'traite_par', 'id_utilisateur');
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function sousCategorie()
    {
        return $this->belongsTo(SousCategorie::class, 'id_sous_categorie', 'id');
    }

    public function rapport()
    {
        return $this->belongsTo(Rapport::class, 'id_rapport', 'id_rapport');
    }

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class, 'id_ticket', 'id_ticket');
    }

    public function demandeAchats()
    {
        return $this->hasMany(DemandeAchat::class, 'id_ticket', 'id_ticket');
    }

    public function actions()
    {
        return $this->hasMany(TicketAction::class, 'id_ticket', 'id_ticket');
    }

    public function historique()
    {
        return $this->hasMany(TicketHistorique::class, 'id_ticket', 'id_ticket');
    }

    public function ticketHistoriques()
    {
        return $this->hasMany(TicketHistorique::class, 'id_ticket', 'id_ticket');
    }
}