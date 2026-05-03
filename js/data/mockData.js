// Ajouter ces données au fichier existant

MockData.matieresParFiliere = {
    'L2-INFO': [
        { id: 1, code: 'MATH101', nom: 'Mathématiques Appliquées', coefficient: 4, heures: 42 },
        { id: 2, code: 'INFO202', nom: 'Algorithmique Avancée', coefficient: 5, heures: 36 },
        { id: 3, code: 'BDD301', nom: 'Bases de Données', coefficient: 4, heures: 30 }
    ],
    'L1-MATH': [
        { id: 1, code: 'MATH101', nom: 'Mathématiques Appliquées', coefficient: 4, heures: 45 },
        { id: 4, code: 'STAT101', nom: 'Statistiques', coefficient: 3, heures: 30 }
    ],
    'M1-DATA': [
        { id: 5, code: 'DATA401', nom: 'Machine Learning', coefficient: 5, heures: 40 },
        { id: 6, code: 'BIG501', nom: 'Big Data', coefficient: 4, heures: 35 }
    ]
};

MockData.absencesParFiliere = [
    { 
        code: 'L2-INFO', 
        nom: 'Licence 2 Informatique',
        effectif: 45, 
        absencesTotales: 67,
        absencesJustifiees: 28,
        absencesNonJustifiees: 39,
        periode: 'Semestre 1 - 2024/2025'
    },
    { 
        code: 'L1-MATH', 
        nom: 'Licence 1 Mathématiques',
        effectif: 38, 
        absencesTotales: 42,
        absencesJustifiees: 18,
        absencesNonJustifiees: 24,
        periode: 'Semestre 1 - 2024/2025'
    },
    { 
        code: 'M1-DATA', 
        nom: 'Master 1 Data Science',
        effectif: 28, 
        absencesTotales: 21,
        absencesJustifiees: 12,
        absencesNonJustifiees: 9,
        periode: 'Semestre 1 - 2024/2025'
    }
];

// Le reste sera généré dynamiquement dans le module
