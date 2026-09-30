<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketEnCoursMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public ?string $message = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[Chaabi LLD] Ticket #{$this->ticket->id_ticket} — Prise en charge",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-en-cours',
        );
    }
}
