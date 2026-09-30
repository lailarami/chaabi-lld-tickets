<?php

// Test script to verify MailService integration
// Run: php artisan tinker < test_mail_integration.php

use App\Services\MailService;
use App\Models\Ticket;
use App\Models\Utilisateur;

// Test 1: Verify mail service connection
echo "🔍 Vérification de la connexion mail-service...\n";
$isConnected = MailService::verify();
if ($isConnected) {
    echo "✅ Service mail connecté\n";
} else {
    echo "❌ Service mail non disponible\n";
}

// Test 2: Send test email
echo "\n📧 Envoi d'un email de test...\n";
$result = MailService::sendEmail(
    'test@example.com',
    'Test de notification Chaabi LLD',
    'Ceci est un email de test pour vérifier que le système d\'envoi fonctionne correctement.'
);

if ($result) {
    echo "✅ Email envoyé avec succès\n";
} else {
    echo "❌ Erreur lors de l\'envoi\n";
}

// Test 3: Send ticket email
echo "\n🎫 Envoi d\'un email de ticket...\n";
$ticketResult = MailService::sendTicketEmail(
    'utilisateur@example.com',
    12345,
    'Pris en charge'
);

if ($ticketResult) {
    echo "✅ Email de ticket envoyé\n";
} else {
    echo "❌ Erreur lors de l\'envoi du ticket\n";
}

echo "\n✅ Tests terminés!\n";
