# Gbayeurs - Gestion des Absences ESATIC

Système moderne de gestion des absences avec authentification par rôle, graphiques de statistiques et recherche globale.

## Technologies
- **Frontend** : HTML5, CSS3 (Glassmorphism), JavaScript Vanilla, Lucide Icons, Chart.js.
- **Backend** : Node.js, Express, MySQL, JWT, Bcrypt.

## Installation

1. **Base de données** :
   - Importez le fichier `schema_mysql.sql` dans votre serveur MySQL (phpMyAdmin ou Aiven).

2. **Configuration** :
   - Créez un fichier `.env` dans le dossier `server/` :
     ```env
     DB_HOST=votre_host
     DB_USER=votre_utilisateur
     DB_PASSWORD=votre_mot_de_passe
     DB_NAME=gestion_absences
     JWT_SECRET=votre_cle_secrete
     ```

3. **Lancement** :
   ```bash
   cd server
   npm install
   npm start
   ```
   L'application sera accessible sur `http://localhost:3000`.

## Comptes de Test
- **Admin** : `admin` / `admin123`
- **Enseignant** : `kouassi` / `prof123`
- **Scolarité** : `scol` / `scol123`
