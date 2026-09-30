<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketAction extends Model
{
    protected $table = 'ticket_actions';
    
    protected $fillable = [
        'id_ticket',
        'id_utilisateur',
        'type_action',
        'description',
        'statut',
        'date_action',
    ];

    protected $casts = [
        'date_action' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
