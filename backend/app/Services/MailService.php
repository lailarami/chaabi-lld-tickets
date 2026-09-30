<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailService
{
    const MAIL_SERVICE_URL = 'http://localhost:3001';
    const TIMEOUT = 30;

    /**
     * Send a plain text email via mail-service
     *
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $text Email body
     * @return bool Success status
     */
    public static function sendEmail(string $to, string $subject, string $text): bool
    {
        try {
            $response = Http::timeout(self::TIMEOUT)->post(
                self::MAIL_SERVICE_URL . '/send-email',
                [
                    'to' => $to,
                    'subject' => $subject,
                    'text' => $text,
                ]
            );

            if ($response->successful()) {
                Log::info("Email sent successfully to {$to}");
                return true;
            }

            Log::error("Failed to send email to {$to}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Mail service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send HTML email via mail-service
     *
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $html HTML body
     * @return bool Success status
     */
    public static function sendHtmlEmail(string $to, string $subject, string $html): bool
    {
        try {
            $response = Http::timeout(self::TIMEOUT)->post(
                self::MAIL_SERVICE_URL . '/send-html-email',
                [
                    'to' => $to,
                    'subject' => $subject,
                    'html' => $html,
                ]
            );

            if ($response->successful()) {
                Log::info("HTML email sent successfully to {$to}");
                return true;
            }

            Log::error("Failed to send HTML email to {$to}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Mail service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send ticket email via mail-service
     *
     * @param string $to Recipient email
     * @param int $ticketId Ticket ID
     * @param string $status Ticket status
     * @param string|null $subject Email subject (optional)
     * @return bool Success status
     */
    public static function sendTicketEmail(string $to, int $ticketId, string $status, ?string $subject = null): bool
    {
        try {
            $response = Http::timeout(self::TIMEOUT)->post(
                self::MAIL_SERVICE_URL . '/send-ticket-email',
                [
                    'to' => $to,
                    'ticketId' => $ticketId,
                    'status' => $status,
                    'subject' => $subject,
                ]
            );

            if ($response->successful()) {
                Log::info("Ticket email sent successfully to {$to} for ticket #{$ticketId}");
                return true;
            }

            Log::error("Failed to send ticket email to {$to}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Mail service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify mail service connection
     *
     * @return bool Is service connected
     */
    public static function verify(): bool
    {
        try {
            $response = Http::timeout(self::TIMEOUT)->get(self::MAIL_SERVICE_URL . '/verify');
            return $response->successful() && $response->json('success', false);
        } catch (\Exception $e) {
            Log::warning("Mail service verification failed: " . $e->getMessage());
            return false;
        }
    }
}
