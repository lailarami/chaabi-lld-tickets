# Mail Service - Chaabi LLD

Service d'envoi d'emails utilisant **Node.js** et **Nodemailer** pour Chaabi LLD Ticketing System.

## Installation

```bash
cd mail-service
npm install
```

## Configuration

### Fichier `.env`

```env
# Email Configuration (Nodemailer)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
EMAIL_FROM="Chaabi LLD - Support IT <votre-email@gmail.com>"

# Server Configuration
MAIL_SERVICE_PORT=3001
NODE_ENV=development

# Gmail SMTP Settings
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

### Configuration Gmail

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Aller à https://myaccount.google.com/apppasswords
   - Sélectionner "Mail" et "Windows"
   - Copier le mot de passe généré
   - Mettre à jour `EMAIL_PASS` dans `.env`

## Démarrage

### Mode production
```bash
npm start
```

### Mode développement (avec watch)
```bash
npm run dev
```

## Endpoints

### 1. Health Check
```
GET /health
```
Vérifie que le service fonctionne.

**Réponse:**
```json
{
  "status": "ok",
  "message": "Mail service is running",
  "timestamp": "2026-04-20T12:00:00.000Z"
}
```

---

### 2. Vérifier la connexion
```
GET /verify
```
Teste la connexion SMTP.

**Réponse (succès):**
```json
{
  "success": true,
  "message": "Email service is connected"
}
```

---

### 3. Envoyer un email (texte simple)
```
POST /send-email
```

**Body:**
```json
{
  "to": "utilisateur@example.com",
  "subject": "Objet de l'email",
  "text": "Contenu du message"
}
```

**Réponse (succès):**
```json
{
  "success": true,
  "messageId": "<email-id@gmail.com>",
  "message": "Email sent successfully"
}
```

---

### 4. Envoyer un email (HTML)
```
POST /send-html-email
```

**Body:**
```json
{
  "to": "utilisateur@example.com",
  "subject": "Objet de l'email",
  "html": "<h1>Titre</h1><p>Contenu HTML</p>"
}
```

---

### 5. Envoyer un email de ticket
```
POST /send-ticket-email
```

**Body:**
```json
{
  "to": "utilisateur@example.com",
  "ticketId": "12345",
  "status": "Pris en charge",
  "subject": "Mise à jour de votre ticket"
}
```

---

## Exemples d'utilisation

### Avec cURL

```bash
# Envoyer un email simple
curl -X POST http://localhost:3001/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test",
    "text": "Ceci est un test"
  }'
```

### Avec JavaScript/Fetch

```javascript
async function sendEmail(to, subject, text) {
  const response = await fetch('http://localhost:3001/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, text })
  });
  return response.json();
}

sendEmail('user@example.com', 'Test', 'Ceci est un test');
```

### Avec Node.js

```javascript
import { sendEmail } from './mailer.js';

const result = await sendEmail(
  'user@example.com',
  'Sujet',
  'Contenu du message'
);

console.log(result);
```

---

## Structure des fichiers

```
mail-service/
├── server.js          # Serveur Express + routes
├── mailer.js          # Service Nodemailer
├── .env              # Variables d'environnement
├── package.json      # Dépendances
└── README.md         # Documentation
```

---

## Dépendances

- **express** - Framework web
- **nodemailer** - Envoi d'emails
- **dotenv** - Gestion des variables d'environnement
- **cors** - Gestion des CORS

---

## Intégration avec Laravel

Pour intégrer ce service avec votre backend Laravel :

```javascript
// Dans votre contrôleur Laravel
// Faire un appel HTTP au service mail

$response = Http::post('http://localhost:3001/send-email', [
    'to' => $user->email,
    'subject' => 'Mon sujet',
    'text' => 'Mon message'
]);
```

---

## Dépannage

### ❌ "Username and Password not accepted"

**Solution:**
- Vérifier que vous utilisez un **mot de passe d'application** (pas votre mot de passe principal)
- Aller à https://myaccount.google.com/apppasswords

### ❌ "Connection timeout"

**Solution:**
- Vérifier la connexion internet
- S'assurer que les ports 587/465 ne sont pas bloqués par un firewall
- Essayer avec un autre email (Mailtrap, SendGrid, etc.)

### ❌ "Service not responding"

**Solution:**
- S'assurer que le service est démarré : `npm start`
- Vérifier le port (défaut: 3001)
- Consulter les logs pour les erreurs

---

## Sécurité

⚠️ **Ne jamais** commiter le fichier `.env` dans Git!

Ajouter à `.gitignore`:
```
.env
node_modules/
```

---

## License

MIT
