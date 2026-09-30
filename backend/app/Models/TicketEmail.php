<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketEmail extends Model
{
    protected $table = 'ticket_email';
    protected $fillable = ['id_ticket', 'email_dest', 'sujet', 'contenu', 'date_envoi'];
    public $timestamps = false;

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket', 'id_ticket');
    }
}
