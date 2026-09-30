<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $table = 'email_logs';
    
    protected $fillable = [
        'id_ticket',
        'destinataire',
        'sujet',
        'contenu',
        'date_envoi',
        'statut',
    ];

    protected $casts = [
        'date_envoi' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }
}
