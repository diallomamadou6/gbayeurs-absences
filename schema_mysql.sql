-- Script de Modélisation MySQL pour Gbayeurs (Version Cloud Aiven)

-- 1. MODULE PARAMETRAGE
CREATE TABLE IF NOT EXISTS PERIODE (
    id_periode INT PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(100),
    date_debut DATE,
    date_fin DATE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MATIERE (
    code_matiere VARCHAR(20) PRIMARY KEY,
    nom_matiere VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ENSEIGNANT (
    id_enseignant INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    specialite VARCHAR(100),
    diplome VARCHAR(100),
    sexe CHAR(1)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS FILIERE (
    code_filiere VARCHAR(20) PRIMARY KEY,
    libelle_filiere VARCHAR(100),
    niveau VARCHAR(50),
    nombre_etudiants INT
) ENGINE=InnoDB;

-- 2. RELATIONS ET SAISIE
CREATE TABLE IF NOT EXISTS ETUDIANT (
    id_etudiant INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    sexe CHAR(1),
    code_filiere VARCHAR(20),
    FOREIGN KEY (code_filiere) REFERENCES FILIERE(code_filiere) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CORRESPONDRE (
    code_filiere VARCHAR(20),
    code_matiere VARCHAR(20),
    volume_horaire INT,
    PRIMARY KEY (code_filiere, code_matiere),
    FOREIGN KEY (code_filiere) REFERENCES FILIERE(code_filiere) ON DELETE CASCADE,
    FOREIGN KEY (code_matiere) REFERENCES MATIERE(code_matiere) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ENSEIGNEMENT (
    id_enseignement INT PRIMARY KEY AUTO_INCREMENT,
    date_seance DATE,
    horaire TIME,
    id_enseignant INT,
    code_filiere VARCHAR(20),
    code_matiere VARCHAR(20),
    id_periode INT,
    FOREIGN KEY (id_enseignant) REFERENCES ENSEIGNANT(id_enseignant) ON DELETE SET NULL,
    FOREIGN KEY (code_filiere) REFERENCES FILIERE(code_filiere) ON DELETE CASCADE,
    FOREIGN KEY (code_matiere) REFERENCES MATIERE(code_matiere) ON DELETE CASCADE,
    FOREIGN KEY (id_periode) REFERENCES PERIODE(id_periode) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ASSISTER (
    id_etudiant INT,
    id_enseignement INT,
    statut VARCHAR(20) DEFAULT 'Présent',
    date_validation DATE,
    PRIMARY KEY (id_etudiant, id_enseignement),
    FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant) ON DELETE CASCADE,
    FOREIGN KEY (id_enseignement) REFERENCES ENSEIGNEMENT(id_enseignement) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS JUSTIFICATION (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_etudiant INT,
    id_enseignement INT,
    motif VARCHAR(255),
    commentaire TEXT,
    date_justification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant) ON DELETE CASCADE,
    FOREIGN KEY (id_enseignement) REFERENCES ENSEIGNEMENT(id_enseignement) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. AUTHENTIFICATION
CREATE TABLE IF NOT EXISTS UTILISATEUR (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    identifiant VARCHAR(50) UNIQUE NOT NULL,
    mot_de_pass VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100),
    role ENUM('admin', 'scolarité', 'enseignant') NOT NULL,
    id_enseignant INT DEFAULT NULL,
    FOREIGN KEY (id_enseignant) REFERENCES ENSEIGNANT(id_enseignant) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. INSERTIONS DE TEST
INSERT INTO FILIERE (code_filiere, libelle_filiere, niveau, nombre_etudiants) VALUES
('INFO-L1', 'Informatique - Licence 1', 'Licence 1', 45),
('INFO-L2', 'Informatique - Licence 2', 'Licence 2', 30),
('DATA-M1', 'Data Science - Master 1', 'Master 1', 25),
('RIT-L1', 'Réseaux et Télécoms - Licence 1', 'Licence 1', 40),
('RIT-L2', 'Réseaux et Télécoms - Licence 2', 'Licence 2', 35),
('SRIT-M1', 'Sécurité et Réseaux - Master 1', 'Master 1', 20)
ON DUPLICATE KEY UPDATE code_filiere=code_filiere;

INSERT INTO ENSEIGNANT (id_enseignant, nom, prenom, email, specialite, sexe) VALUES
(1, 'KOUASSI', 'Jean-Marc', 'jm.kouassi@esatic.ci', 'IA', 'M'),
(2, 'KONAN', 'Ange', 'a.konan@esatic.ci', 'Gestion', 'F'),
(3, 'KAMAGATE', 'Issa', 'i.kamagate@esatic.ci', 'Réseaux', 'M'),
(4, 'BAMBA', 'Fatou', 'f.bamba@esatic.ci', 'Cybersécurité', 'F'),
(5, 'TRAORE', 'Mamadou', 'm.traore@esatic.ci', 'Développement Web', 'M'),
(6, 'KONE', 'Awa', 'a.kone@esatic.ci', 'Mathématiques', 'F'),
(7, 'YAO', 'Kouadio', 'k.yao@esatic.ci', 'Algorithmique', 'M')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO UTILISATEUR (identifiant, mot_de_pass, nom_complet, role, id_enseignant) VALUES
('admin', '$2b$10$ABN2n3Qf25o9bGIohtQYfO5dsvZeGZufYlGfpJ6DyS63sJUrdiFnG', 'Administrateur', 'admin', NULL),
('kouassi', '$2b$10$3uprmhB6jMu8LphLv2LtdO15DruW6eTDFl0nR7iSrBzzwqA.ORapi', 'Prof. KOUASSI', 'enseignant', 1),
('scol', '$2b$10$eYGY7E7uuPa5E42pPUaNserLizknD35XqMx8z.shiYOkDS8BGiPw6', 'Scolarité ESATIC', 'scolarité', NULL)
ON DUPLICATE KEY UPDATE identifiant=identifiant;

INSERT INTO MATIERE (code_matiere, nom_matiere) VALUES 
('ALGO-101', 'Algorithmique'), 
('BDD-201', 'SQL'),
('WEB-101', 'Développement Web L1'),
('MATH-101', 'Mathématiques L1'),
('RES-101', 'Réseaux L1'),
('CYBER-201', 'Cybersécurité L2')
ON DUPLICATE KEY UPDATE code_matiere=code_matiere;

INSERT INTO PERIODE (id_periode, libelle, date_debut, date_fin) VALUES (1, 'Semestre 1', '2026-01-01', '2026-06-30') ON DUPLICATE KEY UPDATE date_fin=VALUES(date_fin), date_debut=VALUES(date_debut);

INSERT INTO ETUDIANT (nom, prenom, sexe, code_filiere) VALUES
('DIALLO', 'Moussa', 'M', 'INFO-L1'), 
('KOFFI', 'Amandine', 'F', 'INFO-L1'),
('TOURE', 'Ali', 'M', 'INFO-L1'),
('SYLLA', 'Mariam', 'F', 'INFO-L1'),
('BAKAYOKO', 'Amadou', 'M', 'INFO-L1'),
('CISSE', 'Kadiatou', 'F', 'INFO-L1'),
('COULIBALY', 'Oumar', 'M', 'INFO-L2'),
('DIABY', 'Aminata', 'F', 'INFO-L2'),
('FANE', 'Ibrahim', 'M', 'INFO-L2'),
('SANOGO', 'Lassina', 'M', 'DATA-M1'),
('OUATTARA', 'Nawa', 'F', 'DATA-M1'),
('DIOMANDE', 'Drissa', 'M', 'RIT-L1'),
('BOUA', 'Aya', 'F', 'RIT-L1'),
('GUEI', 'Hermann', 'M', 'RIT-L1'),
('KOUADIO', 'Brou', 'M', 'RIT-L2'),
('N\'GUESSAN', 'Akissi', 'F', 'RIT-L2'),
('YEO', 'Gnon', 'F', 'SRIT-M1'),
('SORO', 'Zana', 'M', 'SRIT-M1')
ON DUPLICATE KEY UPDATE nom=nom;
