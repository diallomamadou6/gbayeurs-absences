// Module d'édition et rapports

class EditionModule {
    constructor() {
        this.currentTab = 'tab1';
        this.init();
    }

    init() {
        // Gestion des onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Écouteurs pour les filtres
        document.getElementById('report-filiere')?.addEventListener('change', (e) => this.loadMatiereFiliere(e.target.value));
        document.getElementById('generate-report')?.addEventListener('click', () => this.generateAbsenceReport());
        document.getElementById('search-student-report')?.addEventListener('input', (e) => this.searchStudentReport(e.target.value));
        document.getElementById('justified-filiere-filter')?.addEventListener('change', (e) => this.filterJustifiedAbsences(e.target.value));
        
        // Écouter les changements de paramétrage
        document.addEventListener('parametrage-updated', () => this.refreshCurrentTab());
        
        // Charger les données initiales
        this.loadMatiereFiliere(currentConfig.filiere);
        this.loadStudentReport();
        this.loadJustifiedAbsences();
    }

    switchTab(tabId) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabId);
        });
        
        this.currentTab = tabId;
    }

    refreshCurrentTab() {
        switch(this.currentTab) {
            case 'tab1':
                this.loadMatiereFiliere(currentConfig.filiere);
                break;
            case 'tab3':
                this.loadStudentReport();
                break;
            case 'tab4':
                this.loadJustifiedAbsences();
                break;
        }
    }

    loadMatiereFiliere(filiereCode) {
        const container = document.getElementById('matiere-filiere-list');
        const matieres = MOCK_DATA.matieres[filiereCode] || [];
        
        if (matieres.length === 0) {
            container.innerHTML = '<p>Aucune matière trouvée pour cette filière</p>';
            return;
        }
        
        let html = '<div class="matieres-list">';
        matieres.forEach(matiere => {
            html += `
                <div class="matiere-item">
                    <h4>${matiere.nom} (${matiere.code})</h4>
                    <p>Enseignant : ${matiere.enseignant}</p>
                    <p>Volume horaire : ${matiere.heures}h</p>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    generateAbsenceReport() {
        const periode = document.getElementById('report-periode').value;
        const stats = MOCK_DATA.statsParPeriode[periode] || [];
        const tbody = document.getElementById('absences-periode-table');
        
        tbody.innerHTML = '';
        
        stats.forEach(stat => {
            const row = document.createElement('tr');
            const filiereName = this.getFiliereName(stat.filiere);
            const tendance = stat.pourcentagePresence > 95 ? '↗️' : stat.pourcentagePresence > 90 ? '➡️' : '↘️';
            
            row.innerHTML = `
                <td>${filiereName}</td>
                <td>${stat.absences}</td>
                <td>${stat.pourcentagePresence}%</td>
                <td>${tendance}</td>
            `;
            tbody.appendChild(row);
        });
        
        Helpers.showNotification('Rapport généré avec succès', 'success');
    }

    loadStudentReport() {
        const container = document.getElementById('student-individual-report');
        const allStudents = [];
        
        // Collecter tous les étudiants
        Object.values(MOCK_DATA.students).forEach(filiereStudents => {
            allStudents.push(...filiereStudents);
        });
        
        let html = '<div class="students-report-list">';
        allStudents.forEach(student => {
            const justifications = MOCK_DATA.justifiedAbsences.filter(j => j.studentId === student.id);
            
            html += `
                <div class="student-report-item">
                    <strong>${student.prenom} ${student.nom}</strong> (${student.numero})
                    <br>
                    <small>
                        Statut actuel : <span class="status-badge status-${student.status}">${student.status}</span>
                        <br>
                        Absences justifiées : ${justifications.length}
                    </small>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    searchStudentReport(searchTerm) {
        if (!searchTerm) {
            this.loadStudentReport();
            return;
        }
        
        const container = document.getElementById('student-individual-report');
        const allStudents = [];
        
        Object.values(MOCK_DATA.students).forEach(filiereStudents => {
            allStudents.push(...filiereStudents);
        });
        
        const filtered = Helpers.searchInArray(allStudents, searchTerm, ['nom', 'prenom', 'numero']);
        
        let html = '<div class="students-report-list">';
        filtered.forEach(student => {
            html += `
                <div class="student-report-item">
                    <strong>${student.prenom} ${student.nom}</strong> (${student.numero})
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    loadJustifiedAbsences() {
        const container = document.getElementById('justified-absences-list');
        const justifications = MOCK_DATA.justifiedAbsences;
        
        if (justifications.length === 0) {
            container.innerHTML = '<p>Aucune absence justifiée</p>';
            return;
        }
        
        let html = '<div class="justifications-list">';
        justifications.forEach(just => {
            const student = this.findStudentById(just.studentId);
            const studentName = student ? `${student.prenom} ${student.nom}` : 'Étudiant inconnu';
            
            html += `
                <div class="justification-item">
                    <div>
                        <strong>${studentName}</strong><br>
                        <small>${Helpers.formatDate(just.date)} - ${just.motif}</small>
                        ${just.commentaire ? `<br><small><i>${just.commentaire}</i></small>` : ''}
                    </div>
                    <span class="justification-status status-valide">Validé</span>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    filterJustifiedAbsences(filiereCode) {
        if (!filiereCode) {
            this.loadJustifiedAbsences();
            return;
        }
        
        const container = document.getElementById('justified-absences-list');
        const studentsInFiliere = MOCK_DATA.students[filiereCode] || [];
        const studentIds = studentsInFiliere.map(s => s.id);
        
        const filteredJustifications = MOCK_DATA.justifiedAbsences.filter(j => 
            studentIds.includes(j.studentId)
        );
        
        if (filteredJustifications.length === 0) {
            container.innerHTML = '<p>Aucune absence justifiée pour cette filière</p>';
            return;
        }
        
        let html = '<div class="justifications-list">';
        filteredJustifications.forEach(just => {
            const student = this.findStudentById(just.studentId);
            const studentName = student ? `${student.prenom} ${student.nom}` : 'Étudiant inconnu';
            
            html += `
                <div class="justification-item">
                    <div>
                        <strong>${studentName}</strong><br>
                        <small>${Helpers.formatDate(just.date)} - ${just.motif}</small>
                    </div>
                    <span class="justification-status status-valide">Validé</span>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    findStudentById(studentId) {
        for (let filiere in MOCK_DATA.students) {
            const student = MOCK_DATA.students[filiere].find(s => s.id === studentId);
            if (student) return student;
        }
        return null;
    }

    getFiliereName(filiereCode) {
        const names = {
            'L2-INFO': 'L2 Informatique',
            'L1-MATH': 'L1 Mathématiques',
            'M1-DATA': 'M1 Data Science'
        };
        return names[filiereCode] || filiereCode;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.editionModule = new EditionModule();
});
