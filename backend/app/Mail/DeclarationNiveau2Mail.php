<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class DeclarationNiveau2Mail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $objet,
        public string $description,
        public ?string $filePath = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[Chaabi LLD] {$this->objet}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.demande-achat-creation',
            with: [
                'description' => $this->description,
            ]
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        if ($this->filePath && Storage::disk('public')->exists($this->filePath)) {
            $attachments[] = Attachment::fromPath(
                Storage::disk('public')->path($this->filePath)
            );
        }
        return $attachments;
    }
}
