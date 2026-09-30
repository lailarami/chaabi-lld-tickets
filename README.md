# 🏦 Chaabi LLD — Système de Gestion des Tickets

Application SPA professionnelle de gestion des tickets IT pour la Banque Chaabi LLD.

---

## 📋 Prérequis

| Outil       | Version minimale |
|-------------|-----------------|
| PHP         | 8.2+            |
| Composer    | 2.x             |
| Node.js     | 18+             |
| npm         | 9+              |
| MySQL       | 8.0+            |
| Laravel     | 11.x            |

---

## 🗄️ 1. Création de la base de données MySQL

```sql
CREATE DATABASE chaabi_lld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ 2. Configuration du Backend (Laravel — Port 8000)

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### Modifier le fichier `.env` :

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chaabi_lld
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

# Email Outlook Office365
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@chaabilld.ma
MAIL_PASSWORD=votre_mot_de_passe
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tickets@chaabilld.ma
MAIL_FROM_NAME="Chaabi LLD - Support IT"

FRONTEND_URL=http://localhost:3000
```

### Exécuter les migrations et le seeder :

```bash
php artisan migrate --seed
```

### Démarrer le serveur backend :

```bash
php artisan serve --port=8000
```

✅ Backend disponible sur : **http://localhost:8000**

---

## 🎨 3. Configuration du Frontend (React — Port 3000)

```bash
# Aller dans le dossier frontend
cd frontend

# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ Frontend disponible sur : **http://localhost:3000**

---

## 👥 Comptes de démonstration

| Rôle         | Email                        | Mot de passe      |
|--------------|------------------------------|-------------------|
| Admin        | admin@chaabilld.ma           | Admin@2024        |
| Traiteur     | traiteur@chaabilld.ma        | Traiteur@2024     |
| Validateur   | validateur@chaabilld.ma      | Validateur@2024   |
| Utilisateur  | user@chaabilld.ma            | User@2024         |

---

## 📥 Importation de tickets en masse

Pour importer des tickets à partir d'un fichier CSV ou Excel, consultez le guide détaillé:

📖 **[Guide d'importation de tickets](./IMPORT_GUIDE.md)**

> **Astuce**: Le format CSV est recommandé. Si vous avez des fichiers Excel, convertissez-les d'abord en CSV.

---

## 🌐 Ports utilisés

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Backend  | 8000 | http://localhost:8000    |
| Frontend | 3000 | http://localhost:3000    |
| MySQL    | 3306 | localhost                |

---

## 🗂️ Structure du projet

```
chaabi-lld/
├── backend/                    # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TicketController.php
│   │   │   │   ├── AdminController.php
│   │   │   │   └── CategorieController.php
│   │   │   └── Middleware/
│   │   │       └── CheckRole.php
│   │   ├── Models/
│   │   │   ├── Utilisateur.php
│   │   │   ├── Role.php
│   │   │   ├── Ticket.php
│   │   │   ├── Categorie.php
│   │   │   └── Rapport.php
│   │   ├── Mail/
│   │   │   ├── TicketEnCoursMail.php
│   │   │   └── TicketResoluMail.php
│   │   └── Services/
│   │       └── TicketService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/views/emails/
│   │   ├── ticket-en-cours.blade.php
│   │   └── ticket-resolu.blade.php
│   └── routes/api.php
│
└── frontend/                   # React 18 + Tailwind CSS
    └── src/
        ├── pages/
        │   ├── HomePage.jsx        # Landing page
        │   ├── LoginPage.jsx       # Connexion
        │   ├── DashboardPage.jsx   # KPIs
        │   ├── TicketsPage.jsx     # Liste tickets
        │   ├── CreateTicketPage.jsx
        │   ├── TicketDetailPage.jsx
        │   ├── AdminPage.jsx       # CRUD complet
        │   └── ProfilPage.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.jsx
        │   │   ├── Sidebar.jsx
        │   │   └── Navbar.jsx
        │   └── common/
        │       ├── Badges.jsx
        │       ├── KpiCard.jsx
        │       ├── Modal.jsx
        │       └── Loader.jsx
        ├── context/AuthContext.jsx
        └── services/api.js
```

---

## 🔐 Rôles & Accès

| Page / Action           | User | Traiteur | Validateur | Admin |
|------------------------|------|----------|------------|-------|
| Dashboard              | ✅   | ✅       | ✅         | ✅    |
| Créer ticket           | ✅   | ❌       | ❌         | ✅    |
| Voir ses tickets       | ✅   | ❌       | ❌         | ✅    |
| Prendre en charge      | ❌   | ✅       | ❌         | ✅    |
| Résoudre ticket        | ❌   | ✅       | ❌         | ✅    |
| Valider ticket         | ❌   | ❌       | ✅         | ✅    |
| Rejeter ticket         | ❌   | ❌       | ✅         | ✅    |
| Admin panel            | ❌   | ❌       | ❌         | ✅    |

---

## 📧 Emails automatiques (Outlook Office365)

| Événement              | Destinataire  | Déclencheur             |
|------------------------|---------------|-------------------------|
| Prise en charge        | Créateur      | statut → en_cours       |
| Résolution             | Créateur      | statut → resolu         |

---

## 🔄 Cycle de vie d'un ticket

```
cree → en_cours → resolu → valide
                         → rejete
```

---

## 📦 Build de production (Frontend)

```bash
cd frontend
npm run build
# Les fichiers sont dans dist/
```
