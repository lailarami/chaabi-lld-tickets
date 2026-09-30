# Guide d'Intégration - Système d'Emails

## Architecture

### Flux d'envoi d'emails

```
Traiteur (Frontend)
        ↓
Backend Laravel
(TicketController)
        ↓
TicketService
(prendreEnCharge, resoudreTicket)
        ↓
MailService (Laravel wrapper)
        ↓
Node.js Mail-Service
(http://localhost:3001)
        ↓
Nodemailer + Gmail SMTP
        ↓
📧 Utilisateur / Prestataire
```

---

## Configuration

### 1. Backend Laravel

#### Service `App\Services\MailService`
Classe statique qui communique avec le service mail-service Node.js.

**Méthodes disponibles:**
```php
MailService::sendEmail($to, $subject, $text)
MailService::sendHtmlEmail($to, $subject, $html)
MailService::sendTicketEmail($to, $ticketId, $status, $subject)
MailService::verify()
```

#### Service `App\Services\TicketService`
Modifié pour utiliser `MailService` au lieu de Laravel Mail.

**Modifications:**
- `prendreEnCharge()` - Envoie email au créateur du ticket
- `resoudreTicket()` - Envoie email de clôture
- `mettreEnAttente()` - Peut être enrichi
- `reprendreTicket()` - Peut être enrichi

### 2. Node.js Mail-Service

Démarré sur le port **3001** avec Nodemailer.

**Endpoints:**
- `GET /health` - Vérification
- `GET /verify` - Test de connexion SMTP
- `POST /send-email` - Envoi simple
- `POST /send-html-email` - Envoi HTML
- `POST /send-ticket-email` - Envoi pré-formaté

---

## Démarrage

### 1. Démarrer le service mail (Node.js)

```bash
cd mail-service
npm start
```

✅ Service sera disponible sur `http://localhost:3001`

### 2. Vérifier la connexion

```bash
curl http://localhost:3001/verify
```

Réponse attendue:
```json
{
  "success": true,
  "message": "Email service is connected"
}
```

### 3. Utiliser depuis Laravel

```php
// Dans un contrôleur
use App\Services\MailService;

class TicketController {
    public function takeTicket($id) {
        $ticket = Ticket::findOrFail($id);
        
        // L'email est automatiquement envoyé via MailService
        $this->ticketService->prendreEnCharge($ticket, auth()->id());
        
        return response()->json(['message' => 'Ticket pris en charge']);
    }
}
```

---

## Événements d'envoi d'emails

### 1. Prise en charge d'un ticket

**Événement:** `PATCH /api/tickets/{id}/prendre-en-charge`

**Email envoyé à:** Créateur du ticket (utilisateur)

**Sujet:** `Votre ticket #{id} est en cours de traitement`

**Corps:**
```
Votre ticket #{id} a été pris en charge par notre équipe technique. 
Vous serez informé dès que la résolution sera effectuée.
```

**Enregistrement:** `EmailLog` table

---

### 2. Clôture d'un ticket

**Événement:** `POST /api/tickets/{id}/resoudre`

**Email envoyé à:** Créateur du ticket (utilisateur)

**Sujet:** `Votre ticket #{id} est clôturé`

**Corps:**
```
Votre ticket #{id} a été clôturé avec succès.

Résolution: [description fournie par le traiteur]

Merci d'avoir utilisé notre service de support.
```

**Enregistrement:** `EmailLog` table

---

### 3. Validation de demande d'achat (existant)

**Événement:** `POST /api/demandes-achat/{id}/valider`

**Email envoyé à:** Prestataire (email_prestataire)

**Classe Mail:** `DemandeAchatValideeeMail`

**Enregistrement:** Historique ticket

---

### 4. Refus de demande d'achat (existant)

**Événement:** `POST /api/demandes-achat/{id}/refuser`

**Email envoyé à:** Prestataire (email_prestataire)

**Classe Mail:** `DemandeAchatRefuseeMail`

**Enregistrement:** Historique ticket

---

## Test

### Tester manuellement avec Laravel Tinker

```bash
cd backend
php artisan tinker

# Vérifier la connexion
>>> use App\Services\MailService;
>>> MailService::verify();
// true or false

# Envoyer un email de test
>>> MailService::sendEmail('test@example.com', 'Test', 'Ceci est un test');
// true or false
```

### Tester via cURL

```bash
# Vérifier le service mail
curl http://localhost:3001/verify

# Envoyer un email
curl -X POST http://localhost:3001/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "utilisateur@example.com",
    "subject": "Test",
    "text": "Message de test"
  }'
```

---

## Logs

### Logs du backend Laravel

Les tentatives d'envoi d'emails sont enregistrées dans:
- `storage/logs/laravel.log`
- `EmailLog` table (pour chaque email)

### Logs du service Node.js

```
📝 [TIMESTAMP] ✅ Email sent successfully to recipient@example.com
📝 [TIMESTAMP] ❌ Error sending email to recipient@example.com: [error message]
```

---

## Dépannage

### ❌ "Mail service not responding"

**Vérifier:**
1. Service Node.js démarre: `npm start` dans mail-service
2. Port 3001 est libre: `netstat -ano | findstr :3001` (Windows)
3. .env est configuré dans mail-service

### ❌ "SMTP connection failed"

**Vérifier:**
1. Gmail app password est correct
2. Credentials dans mail-service/.env
3. Connexion internet fonctionne

### ❌ "Email not appearing in inbox"

**Vérifier:**
1. Email_logs table: SELECT * FROM email_logs
2. Vérifier dossier SPAM
3. Vérifier les logs Laravel: tail -f storage/logs/laravel.log

---

## Architecture du code

```
Backend (Laravel)
├── app/Services/
│   ├── MailService.php          (Wrapper HTTP vers Node.js)
│   └── TicketService.php        (Utilise MailService)
├── app/Http/Controllers/
│   ├── TicketController.php     (Déclenche les emails)
│   └── DemandeAchatController.php (Emails de demandes)
└── database/migrations/
    └── *create_email_logs_table.php

Mail Service (Node.js)
├── server.js                    (Express + routes)
├── mailer.js                    (Nodemailer)
├── .env                         (Gmail credentials)
└── package.json                 (Dépendances)
```

---

## Flux complet

### Exemple: Prise en charge d'un ticket

1. **Frontend** → `PATCH /api/tickets/123/prendre-en-charge`
2. **TicketController.prendreEnCharge()** → Appelle `$ticketService->prendreEnCharge()`
3. **TicketService.prendreEnCharge()** → Appelle `MailService::sendEmail()`
4. **MailService** → Effectue `POST http://localhost:3001/send-email`
5. **Node.js Mail-Service** → Utilise Nodemailer pour envoyer via Gmail
6. **EmailLog** → Enregistre le résultat (sent/failed)
7. **Frontend** → Notification de succès à l'utilisateur

---

## Points clés

✅ **Centralisé:** Tous les emails passent par `MailService`
✅ **Résilient:** Fallback sur Laravel Mail si service indisponible
✅ **Traçable:** Chaque email est enregistré dans `EmailLog`
✅ **Flexible:** Facile d'ajouter de nouveaux événements d'email
✅ **Scalable:** Peut être remplacé par un service tiers (SendGrid, etc.)

---

## Prochaines étapes

- [ ] Enrichir les templates d'emails (HTML)
- [ ] Ajouter emails pour d'autres événements (reprendre, mise en attente)
- [ ] Implémenter queue pour envois asynchrones
- [ ] Ajouter retry logic
- [ ] Dashboard d'administration des emails
