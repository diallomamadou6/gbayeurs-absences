# Guide de Déploiement - Gbayeurs

## Vue d'ensemble

Ce guide explique comment déployer l'application Gbayeurs sur **Render** (serveur cloud) avec **Aiven** (base de données MySQL cloud).

---

## Prérequis

- Compte GitHub avec le repo `gbayeurs-absences`
- Compte Render ([render.com](https://render.com))
- Compte Aiven ([aiven.io](https://aiven.io)) avec un service MySQL actif
- Terminal avec Git installé

---

## Étapes de déploiement

### 1. Vérifier que la base Aiven est bien allumée

- Allez sur [aiven.io](https://aiven.io)
- Ouvrez votre service MySQL
- Vérifiez que le statut est **ON** (pas `power off`)
- Copiez les credentials :
  - Host (ex: `mysql-xxxxx.h.aivencloud.com`)
  - User (ex: `avnadmin`)
  - Password
  - Database (ex: `gestion_absences`)

### 2. Configurer Render

#### Option A : Si vous avez déjà un service Render

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Ouvrez votre service `gbayeurs-absences`
3. Cliquez sur `Environment` (ou `Settings` → `Environment`)
4. Mettez à jour les variables :

```
DB_HOST=mysql-xxxxx.h.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=votre_password
DB_NAME=gestion_absences
DB_PORT=21345
DB_SSL=true
JWT_SECRET=votre_cle_secrete
```

5. Cliquez `Manual Deploy`
6. Attendez la fin du déploiement (5-10 min)

#### Option B : Si c'est un nouveau déploiement

1. Allez sur [render.com](https://render.com)
2. Cliquez `New` → `Web Service`
3. Connectez votre repo GitHub `gbayeurs-absences`
4. Remplissez :
   - **Name** : `gbayeurs-absences`
   - **Branch** : `main`
   - **Runtime** : Node
   - **Root Directory** : (laisser vide)
   - **Build Command** : `cd server && npm install`
   - **Start Command** : `cd server && npm start`
5. Cliquez sur `Advanced` et ajoutez les variables d'environnement (voir plus haut)
6. Cliquez `Create Web Service`

### 3. Vérifier le déploiement

- Attendez le message : `Your service is live 🎉`
- L'URL sera : `https://gbayeurs-absences.onrender.com`

### 4. Tester l'application

1. Ouvrez `https://gbayeurs-absences.onrender.com` dans votre navigateur
2. Connectez-vous avec :
   - **Identifiant** : `admin`
   - **Mot de passe** : `admin`
3. Si ça marche, c'est bon ! ✅

---

## Dépannage

### Erreur : `getaddrinfo ENOTFOUND mysql-xxxxx.h.aivencloud.com`

**Cause** : Aiven est éteint ou l'host est incorrect.

**Solution** :
1. Vérifiez que Aiven est bien `ON`
2. Copiez exactement le host depuis Aiven (sans espaces)
3. Redéployez sur Render

### Erreur : `Connexion à la base refusée`

**Cause** : Identifiants incorrects.

**Solution** :
1. Vérifiez `DB_USER` et `DB_PASSWORD` dans Aiven
2. Vérifiez `DB_PORT` (souvent 21345 ou 3306)
3. Redéployez

### Erreur : `Service not live`

**Cause** : Erreur de build ou de configuration.

**Solution** :
1. Ouvrez les logs Render (`Logs`)
2. Cherchez l'erreur exacte
3. Vérifiez :
   - Le `Build Command` est correct
   - Le `Start Command` pointe vers `cd server && npm start`
   - Les dépendances npm sont installées

---

## Variables d'environnement expliquées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_HOST` | Hôte MySQL Aiven | `mysql-xxxxx.h.aivencloud.com` |
| `DB_USER` | Utilisateur MySQL | `avnadmin` |
| `DB_PASSWORD` | Mot de passe MySQL | `xxx` |
| `DB_NAME` | Nom de la base | `gestion_absences` |
| `DB_PORT` | Port MySQL | `21345` |
| `DB_SSL` | Utiliser SSL | `true` |
| `JWT_SECRET` | Clé de signature JWT | `votre_cle_secrete` |
| `PORT` | Port serveur (auto sur Render) | `10000` |

---

## Après le déploiement

### URL de partage
- Partagez : `https://gbayeurs-absences.onrender.com`
- Tout le monde peut accéder depuis internet

### Si vous fermez XAMPP
- Pas de problème : Render fonctionne indépendamment
- L'app reste en ligne 24/7

### Pour développer localement
```bash
# Lancer XAMPP (démarrer MySQL)
cd server
npm run dev
# Ouvrir http://localhost:3000
```

### Pour mettre à jour le déploiement
```bash
git add .
git commit -m "Votre message"
git push origin main
```

Render redéploiera automatiquement les nouvelles modifications.

---

## Support

Si vous avez des problèmes :
1. Vérifiez les logs Render (`Logs` dans le dashboard)
2. Vérifiez que Aiven est bien `ON`
3. Vérifiez les variables d'environnement
4. Consultez la section Dépannage ci-dessus

---

**Dernière mise à jour** : 4 mai 2026