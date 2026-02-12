# Stockage des Fichiers - FITZONE Backend

## Structure des Dossiers

Les fichiers uploadÃ©s sont stockÃ©s dans le dossier uploads/ avec la structure suivante :

`
backend/
â””â”€â”€ uploads/
    â”œâ”€â”€ photos/              # Photos d'identitÃ© des membres
    â”œâ”€â”€ certificats/         # Certificats mÃ©dicaux
    â””â”€â”€ assurances/          # Documents d'assurance
`

## Types de Fichiers AcceptÃ©s

- **Images** : JPEG, JPG, PNG
- **Documents** : PDF, DOC, DOCX
- **Taille maximale** : 5 MB par fichier

## Stockage dans la Base de DonnÃ©es

Les chemins des fichiers sont stockÃ©s dans la table inscriptions :

- photo_path : Chemin vers la photo d'identitÃ©
- certificat_medical_path : Chemin vers le certificat mÃ©dical
- ssurance_path : Chemin vers le document d'assurance

**Exemple de chemin stockÃ©** : /uploads/photos/1707123456789-user123-photo.jpg

## Routes API

### Upload des documents d'inscription
`
POST /api/upload/inscription
Content-Type: multipart/form-data

FormData:
- photo: File
- certificat_medical: File
- assurance: File
`

### Upload d'un seul fichier
`
POST /api/upload/single
Content-Type: multipart/form-data

FormData:
- file: File
`

### AccÃ©der Ã  un fichier
`
GET /api/upload/:type/:filename
`

Exemple : GET /api/upload/photos/1707123456789-user123-photo.jpg

## SÃ©curitÃ©

- Les fichiers sont renommÃ©s avec un timestamp pour Ã©viter les collisions
- Validation du type de fichier
- Limite de taille (5MB)
- Les fichiers sont stockÃ©s sur le serveur, pas dans la base de donnÃ©es

## Notes Importantes

âš ï¸ **En production** :
- Configurez un stockage cloud (AWS S3, Cloudinary, etc.)
- Ajoutez une authentification pour protÃ©ger les routes d'upload
- ImplÃ©mentez la compression d'images
- Ajoutez un systÃ¨me de nettoyage des fichiers orphelins
