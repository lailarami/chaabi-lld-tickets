# Guide de Déploiement - Système Avancé de Gestion des Tickets

## Résumé des Modifications

Ce guide couvre l'intégration complète du système avancé de gestion des tickets avec:
- Suivi des actions du traiteur (EN_ATTENTE, ENVOI_EMAIL, RESOLUTION_IMMEDIATE)
- Logging des emails
- Historique des tickets
- Statistiques détaillées du dashboard
- Interface améliorée pour les traiteurs

## 1. Backend - Exécution des Migrations

### 1.1 Vérifier les fichiers de migration
Les trois fichiers de migration créés doivent être présents:
- `backend/database/migrations/2026_04_16_000001_add_columns_to_ticket_table.php`
- `backend/database/migrations/2026_04_16_000002_create_email_logs_table.php`
- `backend/database/migrations/2026_04_16_000003_create_ticket_actions_table.php`

### 1.2 Exécuter les migrations

```bash
cd backend

# Exécuter toutes les migrations en attente
php artisan migrate

# Ou avec seed si nécessaire
php artisan migrate:fresh --seed
```

### 1.3 Vérifier que les tables ont bien été créées

```bash
# Vérifier la structure de la table ticket
php artisan tinker
>>> DB::table('tickets')->getColumns()

# Vérifier la nouvelle table email_logs
>>> DB::table('email_logs')->count()

# Vérifier la nouvelle table ticket_actions
>>> DB::table('ticket_actions')->count()
```

## 2. Backend - Vérifier les Modèles

Les modèles suivants ont été créés/modifiés:

### 2.1 EmailLog (`backend/app/Models/EmailLog.php`)
```php
class EmailLog extends Model {
    // Relations:
    public function ticket() { ... }
}
```

### 2.2 TicketAction (`backend/app/Models/TicketAction.php`)
```php
class TicketAction extends Model {
    // Relations:
    public function ticket() { ... }
    public function utilisateur() { ... }
}
```

### 2.3 Ticket (`backend/app/Models/Ticket.php`)
Relations ajoutées:
```php
public function emailLogs() { ... }
public function actions() { ... }
```

## 3. Backend - Routes API

Les routes suivantes ont été ajoutées (`backend/routes/api.php`):

```
POST   /api/tickets/{id}/mark-pending        - Marquer un ticket en attente
POST   /api/tickets/{id}/send-email          - Envoyer un email
POST   /api/tickets/{id}/resolve-immediate   - Résoudre immédiatement
POST   /api/tickets/{id}/close               - Clôturer un ticket
GET    /api/tickets/{id}/history             - Obtenir l'historique d'un ticket
GET    /api/tickets/traiteur/history         - Historique des tickets du traiteur
GET    /api/statistics/tickets               - Obtenir les statistiques
```

## 4. Backend - Tester les API

### 4.1 Exemple: Marquer un ticket en attente

```bash
curl -X POST http://localhost:8000/api/tickets/1/mark-pending \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "En attente de fournisseur pour achat écran"}'
```

### 4.2 Exemple: Envoyer un email

```bash
curl -X POST http://localhost:8000/api/tickets/1/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sujet": "Mise à jour du ticket #1",
    "contenu": "Votre ticket est en cours de traitement..."
  }'
```

### 4.3 Exemple: Résoudre immédiatement

```bash
curl -X POST http://localhost:8000/api/tickets/1/resolve-immediate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Problème résolu par redémarrage du système"}'
```

### 4.4 Obtenir les statistiques

```bash
curl -X GET http://localhost:8000/api/statistics/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Réponse:
```json
{
  "total": 15,
  "statistiques": {
    "en_attente": {
      "count": 3,
      "percentage": 20.0
    },
    "en_cours": {
      "count": 7,
      "percentage": 46.67
    },
    "clotures": {
      "count": 4,
      "percentage": 26.67
    },
    "resolus": {
      "count": 1,
      "percentage": 6.67
    }
  }
}
```

## 5. Frontend - Composants Créés

### 5.1 TicketActionButtons (`frontend/src/components/TicketActionButtons.jsx`)

Composant pour les actions du traiteur avec:
- Bouton "En Attente" - Marquer comme en attente
- Bouton "Email" - Envoyer un email
- Bouton "Résoudre" - Résoudre immédiatement
- Bouton "Clôturer" - Clôturer le ticket
- Bouton "Historique" - Afficher l'historique

### 5.2 TicketStatistics (`frontend/src/components/TicketStatistics.jsx`)

Composant pour afficher les statistiques avec:
- 4 cartes avec % de tickets par statut
- Barres de progression
- Graphique circulaire (pie chart) SVG

### 5.3 HistoriquePage (`frontend/src/pages/HistoriquePage.jsx`)

Page complète avec:
- Liste de tous les tickets du traiteur
- Filtrage par statut
- Modal pour voir les détails
- Affichage des actions et emails

## 6. Frontend - Routes Ajoutées

Route protégée pour les traiteurs et admins:
```
GET /historique - Page d'historique des tickets
```

## 7. Frontend - Navigation

Lien ajouté au Sidebar pour les traiteurs:
- "Historique" avec icône History

## 8. Vérifications à Effectuer

### 8.1 Vérifier que les migrations sont exécutées
```bash
cd backend
php artisan migrate:status
```

### 8.2 Tester une action simple en frontend

1. Aller à un ticket en tant que traiteur
2. Cliquer sur le bouton "En Attente"
3. Remplir la description et confirmer
4. Vérifier que le ticket passe au statut "en_attente"

### 8.3 Vérifier la page d'historique

1. Aller à la page "Historique" (Sidebar)
2. Vérifier la liste des tickets
3. Filtrer par statut "En attente"
4. Cliquer sur un ticket pour voir les détails

### 8.4 Vérifier le dashboard

1. Aller au Dashboard
2. Vérifier la présence des cartes statistiques
3. Vérifier le graphique circulaire

## 9. Statuts de Tickets Disponibles

- `cree` - Ticket créé par l'utilisateur
- `en_cours` - Pris en charge par un traiteur
- `en_attente` - En attente d'action externe (fournisseur)
- `resolu` - Résolu par le traiteur
- `valide` - Validé par le validateur
- `rejete` - Rejeté par le validateur
- `cloture` - Clôturé après résolution

## 10. Types d'Actions Disponibles

- `RESOLUTION_IMMEDIATE` - Résolution immédiate
- `ENVOI_EMAIL` - Envoi d'un email
- `INTERVENTION_FOURNISSEUR` - En attente d'intervention fournisseur

## 11. Notes Importantes

- Les migrations doivent être exécutées AVANT de démarrer l'application
- Les routes sont protégées par middleware `auth:sanctum`
- Les actions sont limitées aux traiteurs et admins
- Les emails sont loggés dans la table email_logs
- L'historique complet est disponible pour chaque ticket

## 12. Troubleshooting

### Erreur: Table 'email_logs' doesn't exist
Solution: Exécuter `php artisan migrate`

### Erreur 403 Unauthorized
Solution: Vérifier que l'utilisateur a le rôle 'traiteur' ou 'admin'

### Erreur: Relationship not found
Solution: Vérifier que les relations sont bien définies dans les modèles

### Les emails ne sont pas loggés
Solution: Vérifier la configuration d'email dans `config/mail.php`

## 13. Prochaines Étapes

- Ajouter des filtres avancés à la page d'historique
- Implémenter l'export CSV des tickets
- Ajouter des notifications en temps réel
- Intégrer un système de commentaires sur les tickets
