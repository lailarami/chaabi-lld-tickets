# Guide d'importation des tickets

## Format accepté

Le système d'importation accepte actuellement les fichiers **CSV** (Comma-Separated Values).

> **Astuce** : Si vous avez des fichiers Excel (.xlsx, .xls), vous devez les convertir en CSV avant d'importer.

## Comment convertir Excel en CSV

### Méthode 1: Excel / LibreOffice Calc
1. Ouvrez votre fichier Excel
2. Menu → **Fichier** → **Enregistrer sous**
3. Sélectionnez le format **CSV (séparé par des virgules) (.csv)**
4. Cliquez sur **Enregistrer**

### Méthode 2: Excel Online (Office 365)
1. Ouvrez votre fichier dans Excel Online
2. Cliquez sur **Fichier** → **Télécharger**
3. Sélectionnez **Télécharger en tant que** → **CSV**

## Format du fichier CSV

Votre fichier CSV doit contenir une **en-tête** (première ligne) avec les noms des colonnes.

### Colonnes requises
- `objet_ticket` (ou `objet`, `titre`) - **REQUIS**
- `description` (ou `desc`, `contenu`) - **REQUIS**

### Colonnes optionnelles
- `date_creation` - Format: YYYY-MM-DD ou YYYY-MM-DD HH:MM:SS
- `heure_creation` - Format: HH:MM:SS
- `date_ouverture` - Format: YYYY-MM-DD
- `date_cloture` - Format: YYYY-MM-DD
- `priorite` - Valeurs: faible, moyenne, haute, critique
- `statut` - Valeurs: ouvert, en_cours, en_attente, cloture
- `id_utilisateur` - ID numérique de l'utilisateur
- `utilisateur_email` - Email de l'utilisateur (pour auto-résolution)
- `id_categorie` - ID numérique de la catégorie
- `id_sous_categorie` - ID numérique de la sous-catégorie
- `impact` - Description de l'impact
- `typologie` - Type d'incident
- `id_traiteur` - ID du traiteur assigné
- `solution` - Description de la solution
- `notes_traiteur` - Notes du traiteur

### Exemple de fichier CSV

```
objet_ticket,description,priorite,statut,id_utilisateur
"Ticket 1","Description du ticket 1","moyenne","ouvert",1
"Ticket 2","Description du ticket 2","haute","en_cours",2
"Ticket 3","Description du ticket 3","faible","cloture",3
```

## Bonnes pratiques

1. **UTF-8 Encoding** : Assurez-vous que votre fichier est encodé en UTF-8 pour éviter les problèmes de caractères accentués
2. **En-têtes corrects** : Les noms de colonnes doivent correspondre exactement (ou utiliser les variantes acceptées)
3. **Valeurs NULL** : Laissez les cellules vides pour les champs optionnels
4. **Test** : Commencez par importer un petit nombre de tickets test avant de faire une importation en masse
5. **Délimiteur** : Utilisez la virgule (`,`) comme délimiteur (format CSV standard)

## Dépannage

### "0 tickets importés"
- Vérifiez que les colonnes `objet_ticket` et `description` sont présentes
- Assurez-vous que au moins une ligne de données suit l'en-tête
- Vérifiez les logs pour plus de détails (contactez l'administrateur)

### Erreur: "Les fichiers Excel ne sont pas supportés"
- Convertissez votre fichier Excel en CSV en suivant les étapes ci-dessus
- Vérifiez que le fichier est bien un CSV et non un Excel rebaptisé

### Caractères mal encodés
- Ouvrez le fichier CSV avec un éditeur de texte
- Convertissez l'encodage en **UTF-8** et sauvegardez
- Réessayez l'importation

## Support

Pour toute question ou problème lors de l'importation, contactez l'administrateur système.
