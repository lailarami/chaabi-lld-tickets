# 📋 Système Avancé de Gestion des Tickets - Documentation

## 🎯 Vue d'Ensemble

Ce système offre une solution complète de gestion des tickets avec:

### Fonctionnalités Principales

1. **Suivi des Actions du Traiteur**
   - Marquer les tickets en attente (fournisseur)
   - Envoyer des emails de suivi
   - Résoudre immédiatement
   - Clôturer les tickets

2. **Logging Complet**
   - Historique de toutes les actions (email, attente, résolution)
   - Audit trail pour les communications
   - Dates et heure de chaque action

3. **Dashboard Statistiques**
   - Répartition des tickets par statut
   - Pourcentages en temps réel
   - Graphiques visuels interactifs
   - Cartes KPI détaillées

4. **Page d'Historique**
   - Vue complète des tickets du traiteur
   - Filtrage par statut
   - Détails des actions et emails pour chaque ticket

## 📁 Structure des Fichiers Créés

### Backend

```
backend/
├── database/migrations/
│   ├── 2026_04_16_000001_add_columns_to_ticket_table.php
│   ├── 2026_04_16_000002_create_email_logs_table.php
│   └── 2026_04_16_000003_create_ticket_actions_table.php
├── app/Models/
│   ├── EmailLog.php (NEW)
│   ├── TicketAction.php (NEW)
│   └── Ticket.php (UPDATED - relations ajoutées)
├── app/Http/Controllers/
│   └── TicketActionController.php (NEW)
└── routes/
    └── api.php (UPDATED - routes ajoutées)
```

### Frontend

```
frontend/src/
├── components/
│   ├── TicketActionButtons.jsx (NEW)
│   └── TicketStatistics.jsx (NEW)
├── pages/
│   ├── HistoriquePage.jsx (NEW)
│   ├── TicketDetailPage.jsx (UPDATED - TicketActionButtons intégré)
│   └── DashboardPage.jsx (UPDATED - TicketStatistics intégré)
├── App.jsx (UPDATED - route /historique ajoutée)
└── components/layout/
    └── Sidebar.jsx (UPDATED - lien Historique ajouté)
```

## 🔄 Flux de Travail

### Cas 1: Ticket en Attente de Fournisseur

```
User crée ticket
    ↓
Traiteur prend en charge (statut: en_cours)
    ↓
Traiteur clique "En Attente"
    ↓
Statut change à "en_attente"
    ↓
TicketAction créée (type: INTERVENTION_FOURNISSEUR)
    ↓
Ticket reste en attente
    ↓
Traiteur peut le clôturer après résolution
```

### Cas 2: Envoyer Email de Suivi

```
Traiteur analyse ticket (statut: en_cours)
    ↓
Traiteur clique "Email"
    ↓
Remplir sujet et contenu
    ↓
Email envoyé à l'utilisateur
    ↓
EmailLog créée (statut: sent)
    ↓
TicketAction créée (type: ENVOI_EMAIL)
```

### Cas 3: Résoudre Immédiatement

```
Traiteur résout ticket (statut: en_cours)
    ↓
Traiteur clique "Résoudre"
    ↓
Remplir description de résolution
    ↓
Statut change à "resolu"
    ↓
TicketAction créée (type: RESOLUTION_IMMEDIATE)
    ↓
Email de notification envoyé au user
    ↓
Validateur peut valider
```

## 🎨 Composants Détaillés

### TicketActionButtons

Affiche les boutons d'action du traiteur:

```jsx
<TicketActionButtons 
  ticket={ticket} 
  onStatusChange={setTicket} 
/>
```

**Props:**
- `ticket`: Objet ticket complet
- `onStatusChange`: Callback quand le ticket change

**Actions disponibles:**
- En Attente (orange) - Modal avec description
- Email (blue) - Modal avec sujet + contenu
- Résoudre (green) - Modal avec description
- Clôturer (green) - Modal optionnel
- Historique (gray) - Affiche modal avec actions + emails

### TicketStatistics

Composant de statistiques du dashboard:

```jsx
<div className="card">
  <h2>Statistiques détaillées</h2>
  <TicketStatistics />
</div>
```

**Affichage:**
- 4 cartes KPI (en_attente, en_cours, clotures, resolus)
- Barres de progression animées
- Graphique circulaire SVG
- Légende interactive

### HistoriquePage

Page complète d'historique:

```
/historique
```

**Fonctionnalités:**
- Liste paginée de tous les tickets
- Filtres par statut
- Modal détails pour chaque ticket
- Affichage des emails et actions

## 📊 Base de Données

### Table email_logs

```sql
CREATE TABLE email_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    destinataire VARCHAR(255),
    sujet VARCHAR(255),
    contenu TEXT,
    date_envoi DATETIME,
    statut VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE
);
```

### Table ticket_actions

```sql
CREATE TABLE ticket_actions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    id_utilisateur BIGINT NOT NULL,
    type_action ENUM('RESOLUTION_IMMEDIATE', 'ENVOI_EMAIL', 'INTERVENTION_FOURNISSEUR'),
    description TEXT,
    statut VARCHAR(50),
    date_action DATETIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE RESTRICT
);
```

### Colonnes Ticket Ajoutées

- `type_action` - Type d'action (ENUM)
- `niveau` - Niveau de complexité (INT, default: 1)
- `notes_traiteur` - Notes du traiteur (TEXT)
- `statut` - Étendu avec 'en_attente' et 'cloture'

## 🔐 Sécurité

- Routes protégées par `auth:sanctum`
- Middleware rôle `role:traiteur,admin`
- Vérification que traiteur est assigné au ticket
- Relations avec cascade delete appropriées
- RESTRICT sur utilisateur (évite suppression)

## 🎯 Cas d'Utilisation Réels

### Scenario 1: Problème matériel
```
1. User créé ticket: "Écran ne démarre plus"
2. Traiteur analyse: "Besoin d'acheter nouvel écran"
3. Clique "En Attente" avec note "En attente livraison fournisseur"
4. Ticket passe en 'en_attente'
5. Statut visible au user
6. Après réception, Traiteur clôture le ticket
```

### Scenario 2: Maintenance logiciel
```
1. User créé ticket: "Performance lente"
2. Traiteur accède: "Besoin de mettre à jour drivers"
3. Envoie email: "Manutenances en cours, système sera redémarré..."
4. EmailLog créée + TicketAction créée (type: ENVOI_EMAIL)
5. Après maintenance, clique "Résoudre"
6. Ticket passe en 'resolu' → validé
```

### Scenario 3: Support rapide
```
1. User créé ticket: "Oublié mot de passe"
2. Traiteur: "Je peux réinitialiser immédiatement"
3. Clique "Résoudre" avec note "Réinitialisation effectuée"
4. Ticket passe directement en 'resolu'
5. User reçoit email de notification
```

## 📈 Performance

- Indexes sur `id_ticket` pour les relations
- Lazy loading des relations
- Pagination sur historique (20 tickets par page)
- Graphiques SVG (légère et performant)

## 🚀 Déploiement

Voir `DEPLOYMENT_GUIDE.md` pour:
- Exécution des migrations
- Test des APIs
- Vérifications
- Troubleshooting

## 📝 Exemple d'Utilisation

### Pour un Traiteur

1. **Vue d'ensemble**: Dashboard avec statistiques
2. **Voir les tickets**: /tickets
3. **Détails**: Cliquer sur ticket
4. **Actions**: Utiliser boutons en bas
5. **Historique complet**: /historique

### Dans le Code Frontend

```jsx
// TicketDetailPage.jsx
import TicketActionButtons from '../components/TicketActionButtons'

function TicketDetailPage() {
  const [ticket, setTicket] = useState(null)
  
  return (
    <>
      <div>Détails du ticket...</div>
      {isRole('traiteur') && (
        <TicketActionButtons 
          ticket={ticket} 
          onStatusChange={setTicket} 
        />
      )}
    </>
  )
}
```

## 🔗 Relations de Données

```
Ticket
  ├─ hasMany → EmailLog
  ├─ hasMany → TicketAction
  └─ belongsTo → Utilisateur

EmailLog
  └─ belongsTo → Ticket

TicketAction
  ├─ belongsTo → Ticket
  └─ belongsTo → Utilisateur
```

## 📞 Support

Pour des questions ou des bugs:
1. Vérifier DEPLOYMENT_GUIDE.md
2. Vérifier les migrations
3. Vérifier les routes API
4. Vérifier les composants Frontend

---

**Version:** 1.0  
**Date:** 2024  
**Auteur:** Development Team
