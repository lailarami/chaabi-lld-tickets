<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketHistorique extends Model
{
    protected $table = 'ticket_historique';
    public $timestamps = false;

    protected $fillable = [
        'id_ticket',
        'id_user',
        'action',
        'commentaire',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_utilisateur');
    }
}
