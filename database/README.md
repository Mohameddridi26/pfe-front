# Base de DonnÃ©es FITZONE

## Installation

### 1. CrÃ©er la base de donnÃ©es dans phpMyAdmin

1. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
2. Cliquez sur "Nouvelle base de donnÃ©es"
3. Nom : itzone_db
4. Interclassement : utf8mb4_unicode_ci
5. Cliquez sur "CrÃ©er"

### 2. ExÃ©cuter le schÃ©ma

1. SÃ©lectionnez la base itzone_db
2. Cliquez sur l'onglet "Importer"
3. SÃ©lectionnez le fichier schema.sql
4. Cliquez sur "ExÃ©cuter"

## Structure des Tables

- **users** : Tous les utilisateurs (admin, membre, coach)
- **tarifs** : Plans tarifaires
- **tarif_features** : CaractÃ©ristiques des tarifs
- **inscriptions** : Demandes d'inscription
- **inscription_pieces_manquantes** : PiÃ¨ces manquantes
- **paiements** : DÃ©tails de paiement
- **abonnements** : Abonnements actifs
- **coaches** : Informations coaches
- **coach_specialites** : SpÃ©cialitÃ©s (1-2 max)
- **disponibilites** : DisponibilitÃ©s coaches
- **coach_salles** : Salles assignÃ©es
- **seances** : SÃ©ances planifiÃ©es
- **reservations** : RÃ©servations membres
- **reports** : Signalements

## Notes Importantes

1. **Mot de passe** : HashÃ© avec bcrypt dans le backend
2. **Fichiers** : Chemins stockÃ©s dans *_path (upload sur serveur)
3. **Contraintes** :
   - Coach max 2 spÃ©cialitÃ©s (trigger)
   - Un membre = 1 rÃ©servation par sÃ©ance (unique)
   - Nombre d'inscrits mis Ã  jour automatiquement (trigger)

## Prochaines Ã‰tapes

1. Installer les dÃ©pendances backend : cd backend && npm install
2. CrÃ©er les routes API Express.js
3. ImplÃ©menter l'authentification JWT
4. Connecter le frontend aux APIs
