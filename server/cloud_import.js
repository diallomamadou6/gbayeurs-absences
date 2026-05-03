const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true // Très important pour exécuter tout le fichier d'un coup
});

console.log('Connexion au Cloud Aiven en cours...');

const sqlPath = path.join(__dirname, '..', 'schema_mysql.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion :', err.message);
        return;
    }
    console.log('Connecté ! Importation du schéma en cours...');

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'importation :', err.message);
        } else {
            console.log('✅ Schéma importé avec succès sur Aiven !');
            console.log('Vous pouvez maintenant vous connecter sur https://gbayeurs-absences.onrender.com');
        }
        connection.end();
    });
});
