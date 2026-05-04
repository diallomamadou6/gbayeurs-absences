const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : rootEnvPath });

// Configuration de la connexion MySQL
// Vous pouvez modifier ces valeurs dans un fichier .env
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_absences',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err.message);
        console.log('Assurez-vous que MySQL est lancé et que la base "gestion_absences" existe.');
    } else {
        console.log('Connecté à la base de données MySQL avec succès.');
        connection.release();
    }
});

module.exports = pool;
