<?php

namespace App\Mail;

use App\Models\DemandeAchat;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemandeAchatValideeeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DemandeAchat $demande) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[Chaabi LLD] Demande d'achat #{$this->demande->id_demande} — Approuvée",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.demande-achat-validee',
        );
    }
}
