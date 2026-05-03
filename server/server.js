const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// --- ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- SEED TEST DATA (Temporaire) ---
app.get('/seed-test-data', (req, res) => {
    const sql = `
        -- 1. Inscription de plus d'étudiants
        INSERT INTO ETUDIANT (nom, prenom, sexe, code_filiere) VALUES
        ('TRAORE', 'Bakary', 'M', 'INFO-L1'), ('YAO', 'Esther', 'F', 'INFO-L1'),
        ('BAMBA', 'Souleymane', 'M', 'INFO-L1'), ('SIDIBE', 'Awa', 'F', 'INFO-L1'),
        ('CISSE', 'Cheick', 'M', 'INFO-L1'), ('KOUAME', 'Raissa', 'F', 'INFO-L1'),
        ('GADEAU', 'Henriette', 'F', 'INFO-L2'), ('SOUMAHORO', 'Lamine', 'M', 'INFO-L2'),
        ('OUEDRAOGO', 'Aziz', 'M', 'INFO-L2'), ('TOURE', 'Nabintou', 'F', 'INFO-L2'),
        ('COULIBALY', 'Fatoumata', 'F', 'DATA-M1'), ('N''GORAN', 'Patrick', 'M', 'DATA-M1'),
        ('DOUKOUROU', 'Marc', 'M', 'DATA-M1'), ('EHOUMAN', 'Clémence', 'F', 'DATA-M1')
        ON DUPLICATE KEY UPDATE nom=nom;

        -- 2. Plus d'enseignants
        INSERT INTO ENSEIGNANT (nom, prenom, email, specialite, sexe) VALUES
        ('OUATTARA', 'Ibrahim', 'i.ouattara@esatic.ci', 'Reseaux et Telecoms', 'M'),
        ('COULIBALY', 'Mariam', 'm.coulibaly@esatic.ci', 'Droit des Affaires', 'F'),
        ('N''GUESSAN', 'Armand', 'a.nguessan@esatic.ci', 'Développement Web', 'M')
        ON DUPLICATE KEY UPDATE email=email;

        -- 3. Affectation (Matière à Filière)
        INSERT INTO CORRESPONDRE (code_filiere, code_matiere, volume_horaire) VALUES
        ('INFO-L1', 'ALGO-101', 30),
        ('INFO-L1', 'BDD-201', 40),
        ('INFO-L2', 'ALGO-101', 20),
        ('DATA-M1', 'BDD-201', 50)
        ON DUPLICATE KEY UPDATE volume_horaire=volume_horaire;

        -- 4. Enseignements (Cours programmés)
        INSERT INTO ENSEIGNEMENT (date_seance, horaire, id_enseignant, code_filiere, code_matiere, id_periode)
        VALUES 
        ('2025-05-01', '08:00:00', 1, 'INFO-L1', 'ALGO-101', 1),
        ('2025-05-02', '10:00:00', 1, 'INFO-L1', 'ALGO-101', 1),
        ('2025-05-03', '14:00:00', 2, 'INFO-L2', 'BDD-201', 1),
        ('2025-05-04', '08:00:00', 3, 'DATA-M1', 'ALGO-101', 1)
        ON DUPLICATE KEY UPDATE date_seance=date_seance;
        
        -- 5. Absences et Présences aléatoires
        INSERT IGNORE INTO ASSISTER (id_etudiant, id_enseignement, statut, date_validation) VALUES
        (1, 1, 'Présent', CURDATE()), (2, 1, 'Absent', CURDATE()),
        (3, 1, 'Absent', CURDATE()), (4, 1, 'Présent', CURDATE()),
        (1, 2, 'Absent', CURDATE()), (2, 2, 'Absent', CURDATE()),
        (3, 2, 'Présent', CURDATE()), (4, 2, 'Absent', CURDATE()),
        (7, 3, 'Absent', CURDATE()), (8, 3, 'Présent', CURDATE()),
        (9, 3, 'Absent', CURDATE()), (10, 3, 'Absent', CURDATE());

        -- 6. Justifications
        INSERT IGNORE INTO JUSTIFICATION (id_etudiant, id_enseignement, motif, commentaire, date_justification) VALUES
        (2, 1, 'Certificat Médical', 'Maladie certifiée par le médecin', NOW()),
        (3, 1, 'Motif Familial', 'Décès dans la famille', NOW()),
        (7, 3, 'Panne de transport', 'Accident sur le trajet', NOW());
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Erreur : " + err.message);
        res.send("✅ Données de test (Étudiants, Enseignants, Affectations, Absences) insérées avec succès !");
    });
});

// --- AUTHENTICATION ---

app.post('/api/login', (req, res) => {
    const { identifiant, password } = req.body;
    console.log(`Tentative de connexion : ${identifiant}`);

    if (!identifiant || !password) {
        return res.status(400).json({ error: "Identifiant et mot de passe requis" });
    }

    const sql = "SELECT * FROM UTILISATEUR WHERE identifiant = ?";
    db.query(sql, [identifiant], async (err, results) => {
        if (err) {
            console.error("Erreur SQL Login :", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            console.log(`Identifiant inconnu : ${identifiant}`);
            return res.status(401).json({ error: "Identifiant incorrect" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.mot_de_pass);

        if (!isMatch) {
            console.log(`Mot de passe incorrect pour : ${identifiant}`);
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user.id_user, identifiant: user.identifiant, role: user.role, id_enseignant: user.id_enseignant },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        console.log(`Connexion réussie : ${identifiant} (Rôle: ${user.role})`);
        res.json({
            token,
            user: {
                id: user.id_user,
                identifiant: user.identifiant,
                nom_complet: user.nom_complet,
                role: user.role,
                id_enseignant: user.id_enseignant
            }
        });
    });
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Accès refusé, jeton manquant" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Jeton invalide ou expiré" });
        req.user = user;
        next();
    });
};

// Majors (Filières)
app.get('/api/majors', (req, res) => {
    db.query("SELECT * FROM FILIERE", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/majors', (req, res) => {
    const { code_filiere, libelle_filiere, niveau, nombre_etudiants } = req.body;
    const sql = "INSERT INTO FILIERE (code_filiere, libelle_filiere, niveau, nombre_etudiants) VALUES (?, ?, ?, ?)";
    db.query(sql, [code_filiere, libelle_filiere, niveau, nombre_etudiants], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Filière ajoutée", code: code_filiere });
    });
});

// Teachers (Enseignants)
app.get('/api/teachers', (req, res) => {
    db.query("SELECT * FROM ENSEIGNANT", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Subjects (Matières)
app.get('/api/subjects', (req, res) => {
    db.query("SELECT * FROM MATIERE", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Periods (Périodes)
app.get('/api/periods', (req, res) => {
    db.query("SELECT * FROM PERIODE", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Affectations (Enseignements)
app.get('/api/affectations', (req, res) => {
    db.query("SELECT id_enseignement AS id_affectation, id_enseignant, code_filiere, code_matiere, id_periode FROM ENSEIGNEMENT", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/affectations', (req, res) => {
    const { id_enseignant, code_filiere, code_matiere, id_periode } = req.body;
    const sql = "INSERT INTO ENSEIGNEMENT (id_enseignant, code_filiere, code_matiere, id_periode) VALUES (?, ?, ?, ?)";
    db.query(sql, [id_enseignant, code_filiere, code_matiere, id_periode], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id_affectation: result.insertId, message: "Affectation créée" });
    });
});

app.delete('/api/affectations/:id', (req, res) => {
    db.query("DELETE FROM ENSEIGNEMENT WHERE id_enseignement = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Affectation supprimée" });
    });
});

// --- STATS & CHARTS ---

app.get('/api/stats/absences-by-major', (req, res) => {
    const sql = `
        SELECT F.libelle_filiere, COUNT(A.id_etudiant) as total 
        FROM ASSISTER A
        JOIN ENSEIGNEMENT E ON A.id_enseignement = E.id_enseignement
        JOIN FILIERE F ON E.code_filiere = F.code_filiere
        WHERE A.statut IN ('Absent', 'Justifié')
        GROUP BY F.libelle_filiere
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/stats/absences-by-day', (req, res) => {
    const sql = `
        SELECT DATE_FORMAT(date_validation, '%Y-%m-%d') as date, COUNT(*) as total 
        FROM ASSISTER 
        WHERE statut IN ('Absent', 'Justifié')
        GROUP BY date
        ORDER BY date ASC
        LIMIT 10
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/search/students', (req, res) => {
    const query = req.query.q;
    const sql = `
        SELECT ET.*, F.libelle_filiere,
        (SELECT COUNT(*) FROM ASSISTER WHERE id_etudiant = ET.id_etudiant AND statut = 'Absent') as nb_absences,
        (SELECT COUNT(*) FROM ASSISTER WHERE id_etudiant = ET.id_etudiant AND statut = 'Justifié') as nb_justifiees
        FROM ETUDIANT ET
        JOIN FILIERE F ON ET.code_filiere = F.code_filiere
        WHERE ET.nom LIKE ? OR ET.prenom LIKE ?
    `;
    db.query(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Correspondances
app.get('/api/correspondances', (req, res) => {
    db.query("SELECT * FROM CORRESPONDRE", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/correspondances', (req, res) => {
    const { code_filiere, code_matiere, volume_horaire } = req.body;
    const sql = "INSERT INTO CORRESPONDRE (code_filiere, code_matiere, volume_horaire) VALUES (?, ?, ?)";
    db.query(sql, [code_filiere, code_matiere, volume_horaire], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Correspondance ajoutée" });
    });
});

// Students (Étudiants)
app.get('/api/students', (req, res) => {
    db.query("SELECT * FROM ETUDIANT", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/students', (req, res) => {
    const { nom, prenom, sexe, code_filiere } = req.body;
    const sql = "INSERT INTO ETUDIANT (nom, prenom, sexe, code_filiere) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom, prenom, sexe, code_filiere], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id_etudiant: result.insertId, message: "Étudiant inscrit" });
    });
});

app.delete('/api/students/:id', (req, res) => {
    db.query("DELETE FROM ETUDIANT WHERE id_etudiant = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Étudiant supprimé" });
    });
});

// Attendance (Appel / Présences)
app.get('/api/attendance', (req, res) => {
    db.query("SELECT * FROM ENSEIGNEMENT", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Absences à justifier (Détails complets)
app.get('/api/absences-to-justify', (req, res) => {
    const sql = `
        SELECT 
            A.id_etudiant, 
            A.id_enseignement, 
            E.date_seance, 
            E.code_filiere, 
            E.code_matiere,
            ET.nom, 
            ET.prenom,
            F.libelle_filiere,
            M.nom_matiere
        FROM ASSISTER A
        JOIN ENSEIGNEMENT E ON A.id_enseignement = E.id_enseignement
        JOIN ETUDIANT ET ON A.id_etudiant = ET.id_etudiant
        JOIN FILIERE F ON E.code_filiere = F.code_filiere
        JOIN MATIERE M ON E.code_matiere = M.code_matiere
        WHERE A.statut IN ('Absent', 'Justifié')
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/attendance', (req, res) => {
    const { date, code_filiere, code_matiere, id_enseignant, id_periode, absents } = req.body;
    
    // Formater la date pour MySQL (YYYY-MM-DD)
    const formattedDate = date.split('T')[0];
    
    console.log(`Validation appel : Filière=${code_filiere}, Matière=${code_matiere}, Absents=${absents ? absents.length : 0}`);

    // 1. Create the session (ENSEIGNEMENT)
    const sqlSession = "INSERT INTO ENSEIGNEMENT (date_seance, id_enseignant, code_filiere, code_matiere, id_periode) VALUES (?, ?, ?, ?, ?)";
    db.query(sqlSession, [formattedDate, id_enseignant, code_filiere, code_matiere, id_periode], (err, result) => {
        if (err) {
            console.error("Erreur INSERT ENSEIGNEMENT :", err);
            return res.status(500).json({ error: err.message });
        }
        
        const sessionId = result.insertId;
        
        // 2. Mark absents (ASSISTER)
        if (absents && absents.length > 0) {
            // MySQL bulk insert: [ [ [val1, val2], [val3, val4] ] ]
            const values = absents.map(studentId => [studentId, sessionId, 'Absent', formattedDate]);
            const sqlAbsents = "INSERT INTO ASSISTER (id_etudiant, id_enseignement, statut, date_validation) VALUES ?";
            
            db.query(sqlAbsents, [values], (err) => {
                if (err) {
                    console.error("Erreur lors de l'enregistrement des absents (ASSISTER) :", err);
                } else {
                    console.log(`${absents.length} absents enregistrés pour la session ${sessionId}`);
                }
            });
        }
        
        res.json({ id: sessionId, message: "Appel validé" });
    });
});

// Justifications
app.get('/api/justifications', (req, res) => {
    db.query("SELECT * FROM JUSTIFICATION", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/justifications', (req, res) => {
    const { studentId, attendanceId, motif, commentaire, date } = req.body;
    
    // Formater la date pour MySQL (YYYY-MM-DD HH:mm:ss)
    const formattedDate = date ? date.replace('T', ' ').split('.')[0] : null;
    
    console.log(`Justification : Étudiant=${studentId}, Appel=${attendanceId}, Motif=${motif}`);

    const sql = "INSERT INTO JUSTIFICATION (id_etudiant, id_enseignement, motif, commentaire, date_justification) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [studentId, attendanceId, motif, commentaire, formattedDate], (err, result) => {
        if (err) {
            console.error("Erreur INSERT JUSTIFICATION :", err);
            return res.status(500).json({ error: err.message });
        }
        
        // Optionnel : Mettre à jour le statut dans la table ASSISTER
        const sqlUpdate = "UPDATE ASSISTER SET statut = 'Justifié' WHERE id_etudiant = ? AND id_enseignement = ?";
        db.query(sqlUpdate, [studentId, attendanceId], (err2) => {
            if (err2) console.error("Erreur UPDATE ASSISTER statut :", err2);
        });

        res.json({ id: result.insertId, message: "Absence justifiée" });
    });
});

app.delete('/api/justifications/:id', (req, res) => {
    db.query("DELETE FROM JUSTIFICATION WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Justification supprimée" });
    });
});

// Rapports
app.get('/api/reports/absences/:periodId', (req, res) => {
    const sql = `
        SELECT 
            ET.id_etudiant,
            ET.nom, 
            ET.prenom, 
            F.libelle_filiere,
            COUNT(A.id_etudiant) as total_absences
        FROM ETUDIANT ET
        JOIN FILIERE F ON ET.code_filiere = F.code_filiere
        LEFT JOIN ASSISTER A ON ET.id_etudiant = A.id_etudiant AND A.statut = 'Absent'
        LEFT JOIN ENSEIGNEMENT E ON A.id_enseignement = E.id_enseignement
        WHERE E.id_periode = ? OR A.id_etudiant IS NULL
        GROUP BY ET.id_etudiant
        ORDER BY total_absences DESC
    `;
    db.query(sql, [req.params.periodId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
