<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandeAchat extends Model
{
    protected $table = 'demande_achat';
    protected $primaryKey = 'id_demande';

    protected $fillable = [
        'id_ticket',
        'email_prestataire',
        'copy_mail',
        'objet',
        'description',
        'type_contrat',
        'piece_jointe',
        'statut',
        'id_utilisateur',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
