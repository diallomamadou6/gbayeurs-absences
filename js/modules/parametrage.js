Je veux que tu génères uniquement le MODULE PARAMÉTRAGE d’une application web de gestion des absences.

Le projet utilise HTML, CSS et JavaScript pur (ES6), sans framework.

Le code doit être MODULAIRE, CLAIR et PROFESSIONNEL.

========================================
1. OBJECTIF DU MODULE
========================================

Créer une interface permettant de gérer les données de base :

- Filières
- Enseignants
- Matières
- Périodes d’évaluation

Toutes les données sont stockées dans mockData.js (tableaux JS).

========================================
2. STRUCTURE DU FICHIER
========================================

Le code doit être dans :

js/modules/parametrage.js

Le module doit exporter une fonction :

renderParametrage()

========================================
3. INTERFACE UTILISATEUR
========================================

Créer une interface avec :

- Un système d’onglets (tabs)
  - Filières
  - Enseignants
  - Matières
  - Périodes

- Chaque onglet contient :
  - Un formulaire d’ajout
  - Une liste ou un tableau
  - Un bouton supprimer

========================================
4. FONCTIONNALITÉS À IMPLÉMENTER
========================================

=== FILIÈRES ===
- Ajouter une filière
- Afficher liste
- Supprimer

=== ENSEIGNANTS ===
- Ajouter (nom, prénom)
- Afficher liste
- Supprimer

=== MATIÈRES ===
- Ajouter une matière avec :
  - nom
  - filière (select)
  - enseignant (select)
- Afficher liste avec relations
- Supprimer

⚠️ CONTRAINTE :
- Impossible d’ajouter une matière sans filière ou enseignant

=== PÉRIODES ===
- Ajouter une période :
  - nom
  - date début
  - date fin
- Afficher liste
- Supprimer

========================================
5. DONNÉES
========================================

Utiliser ces tableaux :

- filieres[]
- enseignants[]
- matieres[]
- periodes[]

========================================
6. HELPERS
========================================

Utiliser :
- generateId()

========================================
7. VALIDATION
========================================

- Tous les champs sont obligatoires
- Afficher alert() si erreur

========================================
8. BONNES PRATIQUES
========================================

- Code commenté
- Fonctions séparées
- Pas de duplication
- Utiliser map() pour afficher les listes

========================================
9. BONUS
========================================

- Mise à jour automatique de l’interface
- Interface claire et simple

========================================

Génère un fichier complet parametrage.js prêt à être utilisé.
