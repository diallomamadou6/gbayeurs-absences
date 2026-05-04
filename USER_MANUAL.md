# Manuel d'Utilisation - Gbayeurs

## Table des matières

1. [Authentification](#authentification)
2. [Interface générale](#interface-générale)
3. [Dashboard](#dashboard)
4. [Paramétrage](#paramétrage)
5. [Saisie & Appel](#saisie--appel)
6. [Édition & Rapports](#édition--rapports)
7. [Justifications](#justifications)
8. [Recherche Étudiant](#recherche-étudiant)
9. [FAQ](#faq)

---

## Authentification

### Se connecter

1. Allez sur `https://gbayeurs-absences.onrender.com`
2. Remplissez le formulaire de connexion :
   - **Identifiant** : votre nom d'utilisateur
   - **Mot de passe** : votre mot de passe
3. Cliquez sur **"Se Connecter"**

### Créer un compte Enseignant

1. Sur la page de connexion, cliquez sur **"Pas de compte ? S'inscrire (Enseignant)"**
2. Remplissez le formulaire :
   - **Nom** : votre nom de famille
   - **Prénom** : votre prénom
   - **Email** : votre adresse e-mail professionnelle
   - **Spécialité** : votre domaine d'enseignement
   - **Sexe** : sélectionnez votre genre
   - **Identifiant (Connexion)** : créez un identifiant unique
   - **Mot de passe** : créez un mot de passe sécurisé
3. Cliquez sur **"Créer mon compte"**
4. Vous serez connecté automatiquement

### Se déconnecter

- Cliquez sur **"Déconnexion"** en bas du menu latéral gauche

---

## Interface générale

### Layout principal

**Menu latéral (à gauche)** :
- Logo ESATIC et titre "Gestion des Absences"
- Sections **Principal** et **Opérations**
- Liens de navigation vers chaque module
- Bouton **Déconnexion** en bas

**Zone principale** :
- Titre et sous-titre du module
- Contenu dynamique selon le module sélectionné

---

## Dashboard

### Vue d'ensemble

Le Dashboard est votre page d'accueil. Elle affiche :
- Un aperçu global de la gestion des absences
- Statistiques générales
- Accès rapide aux fonctionnalités principales

### Utilisation

1. Cliquez sur **"Dashboard"** dans le menu latéral
2. Consultez les statistiques et informations affichées
3. Utilisez les liens pour naviguer vers les autres modules

---

## Paramétrage

### Vue d'ensemble

Le Paramétrage permet de configurer les données de base de l'application :
- Filières / Programmes d'études
- Matières / Cours
- Périodes académiques
- Enseignants
- Étudiants

### Utilisation

1. Cliquez sur **"Paramétrage"** dans le menu
2. Naviguez entre les onglets (Filières, Matières, Périodes, etc.)
3. **Ajouter** : remplissez le formulaire et cliquez "Ajouter"
4. **Modifier** : cliquez sur une entrée pour l'éditer
5. **Supprimer** : cliquez sur l'icône poubelle (⚠️ action irréversible)

### Champs typiques

- **Filière** : code, libellé, niveau, nombre d'étudiants
- **Matière** : code, nom
- **Période** : dates de début/fin, semestre
- **Enseignant** : nom, prénom, email, spécialité
- **Étudiant** : nom, prénom, genre, filière

---

## Saisie & Appel

### Vue d'ensemble

Ce module permet de :
- Créer des séances de cours
- Faire l'appel (marquer les présences/absences)
- Gérer la liste des étudiants pour une séance

### Étapes d'utilisation

#### 1. Créer une séance

1. Cliquez sur **"Saisie & Appel"**
2. Remplissez le formulaire :
   - **Date** : date du cours
   - **Heure** : heure de début
   - **Matière** : choisissez dans la liste
   - **Filière** : choisissez le groupe d'étudiants
3. Cliquez **"Créer la séance"**

#### 2. Faire l'appel

1. Sélectionnez la séance dans la liste
2. Une table affiche tous les étudiants
3. Pour chaque étudiant, marquez :
   - **Présent** : l'étudiant était là
   - **Absent** : l'étudiant ne s'est pas présenté
   - **Justifié** : l'absence a une justification
4. Cliquez **"Valider l'appel"** en bas

#### 3. Historique

- Consultez les séances précédentes
- Modifiez l'appel si nécessaire

---

## Édition & Rapports

### Vue d'ensemble

Ce module permet de :
- Générer des rapports d'absences
- Exporter les données
- Consulter des statistiques par étudiant, classe, ou période

### Utilisation

1. Cliquez sur **"Édition & Rapports"**
2. Sélectionnez les filtres :
   - **Filière** : groupe d'étudiants
   - **Période** : plage de dates
   - **Enseignant** : (optionnel)
3. Cliquez **"Générer le rapport"**
4. Le rapport s'affiche avec :
   - Nombre de présences/absences
   - Taux d'assiduité
   - Détails par étudiant

### Export

- Cliquez **"Télécharger en Excel"** pour exporter les données
- Le fichier `.xlsx` s'ouvrira dans Excel ou Calc

---

## Justifications

### Vue d'ensemble

Ce module permet de :
- Consulter les demandes de justification d'absence
- Approuver ou rejeter une justification
- Ajouter des commentaires

### Utilisation

1. Cliquez sur **"Justifications"** dans le menu
2. Une liste des justifications en attente s'affiche
3. Pour chaque justification :
   - Consultez le **motif** (certificat médical, motif familial, etc.)
   - Lisez le **commentaire** de l'étudiant
   - **Approuver** : cliquez la case verte pour valider
   - **Rejeter** : cliquez la case rouge pour refuser
   - **Commenter** : ajoutez une note si nécessaire

### Motifs courants

- Certificat Médical
- Motif Familial
- Panne de transport
- Raison personnelle
- Autre (avec description)

---

## Recherche Étudiant

### Vue d'ensemble

Ce module permet de :
- Chercher un étudiant spécifique
- Consulter son dossier
- Voir l'historique d'absences

### Utilisation

1. Cliquez sur **"Recherche Étudiant"**
2. Entrez le nom, prénom ou matériel studentId
3. Cliquez **"Rechercher"**
4. Sélectionnez l'étudiant dans les résultats
5. Consultez :
   - Infos personnelles
   - Historique d'absences
   - Justifications soumises
   - Taux d'assiduité par matière

---

## FAQ

### Puis-je modifier une absence après validation ?

Oui. Dans **Saisie & Appel**, sélectionnez la séance et modifiez le statut de l'étudiant. Cliquez "Valider l'appel" à nouveau.

### Comment importer des étudiants en masse ?

Pour l'instant, les étudiants doivent être ajoutés un par un dans **Paramétrage**. Une importation Excel peut être ajoutée à l'avenir.

### Que se passe-t-il si j'oublie mon mot de passe ?

Contactez l'administrateur. Un système de réinitialisation peut être ajouté ultérieurement.

### Puis-je exporter les données ?

Oui, dans **Édition & Rapports**, cliquez "Télécharger en Excel" pour exporter le rapport.

### Quelles sont les permissions des différents rôles ?

- **Admin** : accès complet à tous les modules
- **Enseignant** : accès à Saisie & Appel, Édition & Rapports, Justifications, Recherche Étudiant
- **Scolarité** : accès au Paramétrage et Édition & Rapports

### Où sont stockées mes données ?

Vos données sont stockées dans une base de données MySQL cloud sécurisée (Aiven). Elles sont sauvegardées automatiquement.

### Puis-je accéder depuis mon téléphone ?

Oui, l'application est responsive et fonctionne sur mobile et tablette. L'URL reste la même : `https://gbayeurs-absences.onrender.com`

---

## Support & Assistance

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez la section FAQ
3. Contactez l'administrateur du système

---

**Version** : 1.0  
**Dernière mise à jour** : 4 mai 2026  
**Application** : Gbayeurs - Gestion des Absences  
**Développement** : ESATIC