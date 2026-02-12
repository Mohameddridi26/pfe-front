# Guide API Postman - Backend FITZONE

## Configuration de base
- **Base URL**: `http://localhost:3000`
- **Port**: `3000`

## Authentification
La plupart des endpoints nécessitent un token JWT dans le header :
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

Pour obtenir un token, utilisez d'abord l'endpoint `/api/auth/login`

---

## 🔐 AUTHENTIFICATION (`/api/auth`)

### 1. Login (Connexion)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/auth/login`
- **Auth**: Aucune
- **Body** (JSON):
```json
{
  "email": "admin@fitzone.com",
  "password": "admin123"
}
```
- **Réponse**: Retourne un token JWT et les données utilisateur

### 2. Obtenir le profil utilisateur
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/auth/me`
- **Auth**: Bearer Token requis
- **Headers**:
```
Authorization: Bearer VOTRE_TOKEN
```

---

## 👥 UTILISATEURS (`/api/users`)

### 1. Obtenir tous les utilisateurs (Admin seulement)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/users`
- **Auth**: Bearer Token + Rôle Admin requis

### 2. Obtenir un utilisateur par ID
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/users/:id`
- **Auth**: Bearer Token requis
- **Exemple**: `http://localhost:3000/api/users/admin-1`

### 3. Mettre à jour un utilisateur
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/users/:id`
- **Auth**: Bearer Token requis
- **Body** (JSON):
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "telephone": "0612345678",
  "cin": "AB123456"
}
```

### 4. Supprimer un utilisateur (Admin seulement)
- **Méthode**: `DELETE`
- **URL**: `http://localhost:3000/api/users/:id`
- **Auth**: Bearer Token + Rôle Admin requis

---

## 💰 TARIFS (`/api/tarifs`)

### 1. Obtenir tous les tarifs (Public)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/tarifs`
- **Auth**: Aucune

### 2. Créer un tarif (Admin seulement)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/tarifs`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "name": "Hebdomadaire",
  "price": 50.00,
  "period": "/semaine",
  "description": "Abonnement d'une semaine",
  "popular": false,
  "features": [
    "Accès à la salle",
    "Cours collectifs"
  ]
}
```

### 3. Mettre à jour un tarif (Admin seulement)
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/tarifs/:id`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "name": "Mensuel",
  "price": 180.00,
  "period": "/mois",
  "description": "Nouvelle description",
  "popular": true,
  "actif": true,
  "features": [
    "Accès illimité",
    "Cours collectifs",
    "Vestiaires"
  ]
}
```

---

## 📝 INSCRIPTIONS (`/api/inscriptions`)

### 1. Créer une inscription (Public)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/inscriptions`
- **Auth**: Aucune
- **Body** (JSON):
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "telephone": "0612345678",
  "cin": "AB123456",
  "type_abonnement_demande": "Mensuel",
  "methode_paiement": "carte_bancaire",
  "photo_path": "/uploads/photos/photo.jpg",
  "certificat_medical_path": "/uploads/certificats/certif.pdf",
  "assurance_path": "/uploads/assurances/assurance.pdf"
}
```

### 2. Obtenir toutes les inscriptions (Admin seulement)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/inscriptions`
- **Auth**: Bearer Token + Rôle Admin requis

### 3. Valider une inscription (Admin seulement)
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/inscriptions/:id/validate`
- **Auth**: Bearer Token + Rôle Admin requis

### 4. Rejeter une inscription (Admin seulement)
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/inscriptions/:id/reject`
- **Auth**: Bearer Token + Rôle Admin requis

---

## 🎫 ABONNEMENTS (`/api/abonnements`)

### 1. Obtenir tous les abonnements (Admin seulement)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/abonnements`
- **Auth**: Bearer Token + Rôle Admin requis

### 2. Obtenir l'abonnement d'un membre
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/abonnements/user/:userId`
- **Auth**: Bearer Token requis
- **Exemple**: `http://localhost:3000/api/abonnements/user/user-123`

### 3. Créer un abonnement (Admin seulement)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/abonnements`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "user_id": "user-123",
  "tarif_id": "mensuel",
  "date_debut": "2024-01-01",
  "methode_paiement": "carte_bancaire"
}
```

### 4. Renouveler un abonnement
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/abonnements/:id/renew`
- **Auth**: Bearer Token requis
- **Body** (JSON):
```json
{
  "tarif_id": "trimestriel",
  "methode_paiement": "virement"
}
```

---

## 🏋️ SÉANCES (`/api/seances`)

### 1. Obtenir toutes les séances (Public)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/seances`
- **Auth**: Aucune
- **Query Parameters** (optionnels):
  - `coach_id`: Filtrer par coach
  - `date`: Filtrer par date (format: YYYY-MM-DD)
  - `salle`: Filtrer par salle
- **Exemple**: `http://localhost:3000/api/seances?date=2024-01-15&salle=Boxe`

### 2. Créer une séance (Admin seulement)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/seances`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "coach_id": "coach-123",
  "salle": "Boxe",
  "activite": "Boxe",
  "date": "2024-01-15",
  "heure_debut": "10:00:00",
  "duree": 60,
  "capacite_max": 20
}
```

### 3. Marquer une séance comme complétée (Admin seulement)
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/seances/:id/complete`
- **Auth**: Bearer Token + Rôle Admin requis

---

## 📅 RÉSERVATIONS (`/api/reservations`)

### 1. Obtenir toutes les réservations
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/reservations`
- **Auth**: Bearer Token requis
- **Query Parameters** (optionnels):
  - `user_id`: Filtrer par utilisateur
  - `seance_id`: Filtrer par séance
  - `date`: Filtrer par date

### 2. Créer une réservation (Membre ou Admin)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/reservations`
- **Auth**: Bearer Token + Rôle Membre ou Admin requis
- **Body** (JSON):
```json
{
  "seance_id": "seance-123",
  "user_id": "user-123"
}
```

### 3. Annuler une réservation
- **Méthode**: `DELETE`
- **URL**: `http://localhost:3000/api/reservations/:id`
- **Auth**: Bearer Token requis

---

## 👨‍🏫 COACHES (`/api/coaches`)

### 1. Obtenir tous les coaches (Public)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/coaches`
- **Auth**: Aucune

### 2. Créer un coach (Admin seulement)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/coaches`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "nom": "Martin",
  "prenom": "Pierre",
  "email": "pierre.martin@fitzone.com",
  "password": "coach123",
  "telephone": "0612345678",
  "specialites": ["Boxe", "Musculation"],
  "salles": ["Boxe", "Musculation"]
}
```

### 3. Obtenir les disponibilités d'un coach
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/coaches/:coachId/disponibilites`
- **Auth**: Bearer Token requis
- **Exemple**: `http://localhost:3000/api/coaches/coach-123/disponibilites`

---

## 📢 REPORTS (`/api/reports`)

### 1. Obtenir tous les reports (Admin seulement)
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/api/reports`
- **Auth**: Bearer Token + Rôle Admin requis

### 2. Créer un report (Membre ou Coach)
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/reports`
- **Auth**: Bearer Token requis
- **Body** (JSON):
```json
{
  "type": "probleme_technique",
  "titre": "Problème avec la machine",
  "description": "La machine de musculation ne fonctionne pas correctement"
}
```

### 3. Répondre à un report (Admin seulement)
- **Méthode**: `PUT`
- **URL**: `http://localhost:3000/api/reports/:id/respond`
- **Auth**: Bearer Token + Rôle Admin requis
- **Body** (JSON):
```json
{
  "reponse_admin": "Le problème a été résolu",
  "statut": "resolu"
}
```

---

## 📤 UPLOAD (`/api/upload`)

### 1. Uploader des documents d'inscription
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/upload/inscription`
- **Auth**: Aucune
- **Body**: `form-data`
  - `photo`: (file) Photo du membre
  - `certificat_medical`: (file) Certificat médical
  - `assurance`: (file) Assurance

### 2. Uploader un seul fichier
- **Méthode**: `POST`
- **URL**: `http://localhost:3000/api/upload/single`
- **Auth**: Aucune
- **Body**: `form-data`
  - `file`: (file) Fichier à uploader

---

## 🏠 RACINE (`/`)

### Info API
- **Méthode**: `GET`
- **URL**: `http://localhost:3000/`
- **Auth**: Aucune
- **Réponse**: Liste de tous les endpoints disponibles

---

## 📋 Workflow de test recommandé

1. **Obtenir un token**:
   - `POST /api/auth/login` avec les identifiants admin

2. **Tester les endpoints publics**:
   - `GET /api/tarifs`
   - `GET /api/seances`
   - `GET /api/coaches`

3. **Tester les endpoints protégés**:
   - Ajouter le token dans le header `Authorization: Bearer TOKEN`
   - Tester les endpoints admin, membre, coach selon votre rôle

4. **Créer des données de test**:
   - Créer des inscriptions
   - Créer des séances
   - Créer des réservations

---

## 🔑 Identifiants de test

- **Email**: `admin@fitzone.com`
- **Mot de passe**: `admin123`
- **Rôle**: `admin`

---

## ⚠️ Notes importantes

1. **Token JWT**: Le token expire après un certain temps. Si vous recevez une erreur 401, reconnectez-vous.

2. **Rôles**:
   - `admin`: Accès complet
   - `membre`: Accès limité aux fonctionnalités membres
   - `coach`: Accès aux fonctionnalités coach

3. **Format des dates**: Utilisez le format `YYYY-MM-DD` pour les dates.

4. **Format des heures**: Utilisez le format `HH:MM:SS` pour les heures (ex: `10:00:00`).

5. **Variables Postman**: Vous pouvez créer une variable `base_url` avec la valeur `http://localhost:3000` et utiliser `{{base_url}}` dans vos requêtes.
