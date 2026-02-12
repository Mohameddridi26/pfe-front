-- ============================================
-- SCHEMA BASE DE DONNÃ‰ES FITZONE
-- ============================================
CREATE DATABASE IF NOT EXISTS fitzone_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitzone_db;

-- TABLE: users
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'membre', 'coach') NOT NULL,
    telephone VARCHAR(20),
    cin VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: tarifs
CREATE TABLE tarifs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    description TEXT,
    popular BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tarif_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarif_id VARCHAR(50) NOT NULL,
    feature VARCHAR(255) NOT NULL,
    FOREIGN KEY (tarif_id) REFERENCES tarifs(id) ON DELETE CASCADE,
    INDEX idx_tarif_id (tarif_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: inscriptions
CREATE TABLE inscriptions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    cin VARCHAR(20) NOT NULL,
    date_soumission DATE NOT NULL,
    statut ENUM('en_attente_validation', 'en_attente_pieces', 'valide', 'rejete') NOT NULL DEFAULT 'en_attente_validation',
    certificat_medical BOOLEAN DEFAULT FALSE,
    assurance BOOLEAN DEFAULT FALSE,
    photo BOOLEAN DEFAULT FALSE,
    type_abonnement_demande ENUM('Mensuel', 'Trimestriel', 'Annuel'),
    methode_paiement ENUM('carte_bancaire', 'virement', 'especes', 'cheque'),
    photo_path VARCHAR(500),
    certificat_medical_path VARCHAR(500),
    assurance_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_statut (statut),
    INDEX idx_date_soumission (date_soumission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inscription_pieces_manquantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscription_id VARCHAR(50) NOT NULL,
    piece VARCHAR(255) NOT NULL,
    FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE,
    INDEX idx_inscription_id (inscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paiements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscription_id VARCHAR(50) NOT NULL,
    methode ENUM('carte_bancaire', 'virement', 'especes', 'cheque') NOT NULL,
    details_json JSON,
    numero_carte VARCHAR(19),
    date_expiration VARCHAR(5),
    cvv VARCHAR(4),
    titulaire VARCHAR(255),
    iban VARCHAR(34),
    bic VARCHAR(11),
    nom_banque VARCHAR(255),
    numero_cheque VARCHAR(50),
    date_echeance DATE,
    montant DECIMAL(10, 2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE,
    INDEX idx_inscription_id (inscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: abonnements
CREATE TABLE abonnements (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    tarif_id VARCHAR(50) NOT NULL,
    type ENUM('Mensuel', 'Trimestriel', 'Annuel') NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut ENUM('actif', 'expire', 'a_renouveler', 'suspendu') NOT NULL DEFAULT 'actif',
    renouvellement_auto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tarif_id) REFERENCES tarifs(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_statut (statut),
    INDEX idx_date_fin (date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: coaches
CREATE TABLE coaches (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    tel VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coach_specialites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id VARCHAR(50) NOT NULL,
    specialite VARCHAR(100) NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coach_specialite (coach_id, specialite),
    INDEX idx_coach_id (coach_id),
    INDEX idx_specialite (specialite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE disponibilites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id VARCHAR(50) NOT NULL,
    jour_semaine TINYINT NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    INDEX idx_coach_id (coach_id),
    INDEX idx_jour_semaine (jour_semaine),
    CHECK (jour_semaine >= 0 AND jour_semaine <= 6),
    CHECK (heure_debut < heure_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coach_salles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id VARCHAR(50) NOT NULL,
    salle VARCHAR(100) NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coach_salle (coach_id, salle),
    INDEX idx_coach_id (coach_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: seances
CREATE TABLE seances (
    id VARCHAR(50) PRIMARY KEY,
    activite ENUM('musculation', 'crossfit', 'yoga', 'zumba', 'boxe', 'pilates') NOT NULL,
    coach_id VARCHAR(50) NOT NULL,
    salle VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    capacite_max INT DEFAULT 20,
    inscrits INT DEFAULT 0,
    completee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE RESTRICT,
    INDEX idx_coach_id (coach_id),
    INDEX idx_date (date),
    INDEX idx_activite (activite),
    INDEX idx_completee (completee),
    CHECK (heure_debut < heure_fin),
    CHECK (capacite_max > 0),
    CHECK (inscrits >= 0),
    CHECK (inscrits <= capacite_max)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: reservations
CREATE TABLE reservations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    seance_id VARCHAR(50) NOT NULL,
    date_reservation DATE NOT NULL,
    present BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_seance (user_id, seance_id),
    INDEX idx_user_id (user_id),
    INDEX idx_seance_id (seance_id),
    INDEX idx_date_reservation (date_reservation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: reports
CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    auteur_id VARCHAR(50) NOT NULL,
    auteur_role ENUM('membre', 'coach') NOT NULL,
    type ENUM('probleme_technique', 'probleme_seance', 'probleme_coach', 'probleme_equipement', 'autre') NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date_creation DATE NOT NULL,
    statut ENUM('en_attente', 'en_cours', 'resolu', 'rejete') NOT NULL DEFAULT 'en_attente',
    reponse_admin TEXT,
    date_reponse DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_auteur_id (auteur_id),
    INDEX idx_statut (statut),
    INDEX idx_date_creation (date_creation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TRIGGERS
DELIMITER //
CREATE TRIGGER after_reservation_insert
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
    UPDATE seances 
    SET inscrits = inscrits + 1 
    WHERE id = NEW.seance_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_reservation_delete
AFTER DELETE ON reservations
FOR EACH ROW
BEGIN
    UPDATE seances 
    SET inscrits = GREATEST(0, inscrits - 1) 
    WHERE id = OLD.seance_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_max_specialites
BEFORE INSERT ON coach_specialites
FOR EACH ROW
BEGIN
    DECLARE specialite_count INT;
    SELECT COUNT(*) INTO specialite_count 
    FROM coach_specialites 
    WHERE coach_id = NEW.coach_id;
    
    IF specialite_count >= 2 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Un coach ne peut avoir que 2 specialites maximum';
    END IF;
END//
DELIMITER ;

-- DONNÃ‰ES INITIALES
INSERT INTO tarifs (id, name, price, period, description, popular, actif) VALUES
('mensuel', 'Mensuel', 160.00, '/mois', 'AccÃ¨s flexible sans engagement', FALSE, TRUE),
('trimestriel', 'Trimestriel', 420.00, '/3 mois', 'L''Ã©quilibre parfait', TRUE, TRUE),
('annuel', 'Annuel', 1460.00, '/an', 'Le meilleur rapport qualitÃ©/prix', FALSE, TRUE);

INSERT INTO tarif_features (tarif_id, feature) VALUES
('mensuel', 'AccÃ¨s illimitÃ© Ã  la salle'),
('mensuel', 'Cours collectifs inclus'),
('mensuel', 'Vestiaires & Douches'),
('mensuel', 'Application mobile'),
('trimestriel', 'Tout du forfait Mensuel'),
('trimestriel', '1 sÃ©ance coaching offerte'),
('trimestriel', 'Programme IA personnalisÃ©'),
('trimestriel', 'AccÃ¨s heures creuses Ã©tendu'),
('trimestriel', 'Gel d''abonnement (7 jours)'),
('annuel', 'Tout du forfait Trimestriel'),
('annuel', '4 sÃ©ances coaching offertes'),
('annuel', 'AccÃ¨s 24h/24'),
('annuel', 'Gel d''abonnement (30 jours)'),
('annuel', 'InvitÃ© gratuit 1x/mois'),
('annuel', 'RÃ©duction partenaires');

-- INDEX SUPPLÃ‰MENTAIRES
CREATE INDEX idx_seances_coach_date ON seances(coach_id, date);
CREATE INDEX idx_reservations_user_date ON reservations(user_id, date_reservation);
CREATE INDEX idx_abonnements_user_statut ON abonnements(user_id, statut);
