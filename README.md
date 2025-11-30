# MeshCentral Notes Plugin

Plugin de prise de notes centralisées pour MeshCentral permettant aux techniciens de partager des informations importantes.

## Fonctionnalités

- ✅ **Notes globales** : Visibles par tous les techniciens
- ✅ **Notes par device** : Attachées à des machines spécifiques
- ✅ **Recherche** : Trouvez rapidement vos notes
- ✅ **Tags** : Organisez vos notes avec des étiquettes
- ✅ **Historique** : Qui a créé/modifié chaque note et quand
- ✅ **Interface web** : Interface simple et intuitive

## Installation

1. Copiez le dossier `meshcentral-notes` dans le répertoire `node_modules` de votre installation MeshCentral

2. Ajoutez le plugin dans votre fichier `config.json` :

```json
{
  "settings": {
    "plugins": {
      "enabled": true
    }
  },
  "domains": {
    "": {
      "plugins": {
        "notes": {
          "enabled": true
        }
      }
    }
  }
}
```

3. Redémarrez MeshCentral

## Utilisation

### Accéder à l'interface

Une fois le plugin installé, accédez à l'interface via : `https://votre-meshcentral/notes`

### Créer une note

1. Cliquez sur le bouton "Nouvelle Note"
2. Remplissez le titre et le contenu
3. Ajoutez des tags optionnels (séparés par des virgules)
4. Cliquez sur "Enregistrer"

### Rechercher des notes

Utilisez la barre de recherche pour filtrer les notes par titre, contenu ou tags.

### Notes liées aux devices

Les notes peuvent être attachées à des machines spécifiques pour documenter :
- Configurations particulières
- Problèmes récurrents
- Procédures spécifiques
- Historique des interventions

## Structure de données

Chaque note contient :
- **ID** : Identifiant unique
- **Titre** : Titre de la note
- **Contenu** : Contenu détaillé
- **Tags** : Étiquettes pour catégoriser
- **Auteur** : Qui a créé la note
- **Date de création** : Quand la note a été créée
- **Dernière modification** : Qui et quand
- **Device** : Machine associée (optionnel)

## API

Le plugin expose une API pour interagir avec les notes :

### Créer une note
```javascript
{
  "action": "createNote",
  "title": "Titre de la note",
  "content": "Contenu de la note",
  "tags": ["tag1", "tag2"],
  "nodeid": "device_id" // optionnel
}
```

### Mettre à jour une note
```javascript
{
  "action": "updateNote",
  "noteId": "note_id",
  "title": "Nouveau titre",
  "content": "Nouveau contenu",
  "tags": ["tag1", "tag2"]
}
```

### Supprimer une note
```javascript
{
  "action": "deleteNote",
  "noteId": "note_id"
}
```

### Obtenir les notes d'un device
```javascript
{
  "action": "getNodeNotes",
  "nodeid": "device_id"
}
```

### Obtenir toutes les notes globales
```javascript
{
  "action": "getGlobalNotes"
}
```

### Rechercher des notes
```javascript
{
  "action": "searchNotes",
  "query": "terme de recherche"
}
```

## Développement futur

Fonctionnalités prévues :
- [ ] Support Markdown pour le formatage
- [ ] Pièces jointes
- [ ] Notifications
- [ ] Export PDF/CSV
- [ ] Permissions granulaires
- [ ] Historique des versions
- [ ] Commentaires sur les notes

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Apache-2.0

## Auteur

V3locidad

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
