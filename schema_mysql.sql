-- Script de Modélisation MySQL pour Gbayeurs
-- À importer via phpMyAdmin

CREATE DATABASE IF NOT EXISTS gestion_absences;
USE gestion_absences;

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

-- 3. INSERTION DE DONNÉES DE TEST (MOCK DATA IVOIRIEN)
INSERT INTO FILIERE (code_filiere, libelle_filiere, niveau, nombre_etudiants) VALUES
('INFO-L1', 'Informatique - Licence 1', 'Licence 1', 45),
('INFO-L2', 'Informatique - Licence 2', 'Licence 2', 30),
('DATA-M1', 'Data Science - Master 1', 'Master 1', 25),
('GEST-L1', 'Gestion - Licence 1', 'Licence 1', 50),
('RTEL-L2', 'Réseaux & Télécoms - Licence 2', 'Licence 2', 35)
ON DUPLICATE KEY UPDATE code_filiere=code_filiere;

INSERT INTO ENSEIGNANT (nom, prenom, email, specialite, diplome, sexe) VALUES
('KOUASSI', 'Jean-Marc', 'jm.kouassi@esatic.ci', 'Intelligence Artificielle', 'Doctorat', 'M'),
('KONAN', 'Ange Roseline', 'a.konan@esatic.ci', 'Gestion et Finance', 'Master', 'F'),
('OUATTARA', 'Ibrahim', 'i.ouattara@esatic.ci', 'Reseaux et Telecoms', 'Doctorat', 'M'),
('COULIBALY', 'Mariam', 'm.coulibaly@esatic.ci', 'Droit des Affaires', 'Doctorat', 'F'),
('N\'GUESSAN', 'Armand', 'a.nguessan@esatic.ci', 'Développement Web', 'Master', 'M')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO MATIERE (code_matiere, nom_matiere) VALUES
('ALGO-101', 'Algorithmique & C++'),
('BDD-201', 'Bases de Données SQL'),
('WEB-102', 'Développement Web Frontend'),
('MATH-101', 'Mathématiques Discrètes'),
('ECON-101', 'Économie de l\'Entreprise'),
('RT-201', 'Architecture Réseaux'),
('PY-301', 'Python pour la Data Science'),
('ANG-101', 'Anglais Technique')
ON DUPLICATE KEY UPDATE code_matiere=code_matiere;

INSERT INTO PERIODE (id_periode, libelle, date_debut, date_fin) VALUES
(1, 'Semestre 1 - 2025/2026', '2025-01-01', '2026-06-30'),
(2, 'Semestre 2 - 2026/2027', '2026-07-01', '2027-12-31')
ON DUPLICATE KEY UPDATE id_periode=id_periode;

INSERT INTO ETUDIANT (nom, prenom, sexe, code_filiere) VALUES
('DIALLO', 'Moussa', 'M', 'INFO-L1'), ('KOFFI', 'Amandine', 'F', 'INFO-L1'),
('TRAORE', 'Bakary', 'M', 'INFO-L1'), ('YAO', 'Esther', 'F', 'INFO-L1'),
('BAMBA', 'Souleymane', 'M', 'INFO-L1'), ('SIDIBE', 'Awa', 'F', 'INFO-L1'),
('CISSE', 'Cheick', 'M', 'INFO-L1'), ('KOUAME', 'Raissa', 'F', 'INFO-L1'),
('GADEAU', 'Henriette', 'F', 'INFO-L2'), ('SOUMAHORO', 'Lamine', 'M', 'INFO-L2'),
('OUEDRAOGO', 'Aziz', 'M', 'INFO-L2'), ('TOURE', 'Nabintou', 'F', 'INFO-L2'),
('COULIBALY', 'Fatoumata', 'F', 'DATA-M1'), ('N\'GORAN', 'Patrick', 'M', 'DATA-M1'),
('DOUKOUROU', 'Marc', 'M', 'DATA-M1'), ('EHOUMAN', 'Clémence', 'F', 'DATA-M1'),
('SYLLA', 'Ousmane', 'M', 'GEST-L1'), ('ZADIG', 'Elodie', 'F', 'GEST-L1'),
('GNAMIEN', 'Arnaud', 'M', 'GEST-L1'), ('ADOU', 'Koffi', 'M', 'RTEL-L2'),
('KONE', 'Maimouna', 'F', 'RTEL-L2');
