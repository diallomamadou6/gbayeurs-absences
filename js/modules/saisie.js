// Module de saisie des présences

class SaisieModule {
    constructor() {
        this.tableBody = document.getElementById('student-table-body');
        this.justificationPanel = document.getElementById('justification-panel');
        this.selectedStudent = null;
        this.init();
    }

    init() {
        // Écouteurs d'événements
        document.getElementById('mark-all-present').addEventListener('click', () => this.markAllPresent());
        document.getElementById('send-message-absents').addEventListener('click', () => this.sendMessageToAbsents());
        document.getElementById('save-justification').addEventListener('click', () => this.saveJustification());
        
        // Recherche d'étudiants
        document.getElementById('search-student').addEventListener('input', (e) => this.searchStudents(e.target.value));
        
        // Écouter les changements de paramétrage
        document.addEventListener('parametrage-updated', (e) => this.loadStudents(e.detail.filiere));
        
        // Charger les étudiants initiaux
        this.loadStudents(currentConfig.filiere);
    }

    loadStudents(filiereCode) {
        const students = MOCK_DATA.students[filiereCode] || [];
        this.renderStudentTable(students);
    }

    renderStudentTable(students) {
        this.tableBody.innerHTML = '';
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.numero}</td>
                <td>${student.prenom} ${student.nom}</td>
                <td>
                    <span class="status-badge status-${student.status}">
                        ${this.getStatusText(student.status)}
                    </span>
                </td>
                <td class="table-actions">
                    <button class="btn btn-small btn-success" onclick="saisieModule.updateStatus(${student.id}, 'present')">
                        Présent
                    </button>
                    <button class="btn btn-small btn-danger" onclick="saisieModule.updateStatus(${student.id}, 'absent')">
                        Absent
                    </button>
                    <button class="btn btn-small btn-warning" onclick="saisieModule.openJustificationPanel(${student.id})">
                        Justifier
                    </button>
                    <button class="btn btn-small btn-primary" onclick="saisieModule.sendIndividualMessage(${student.id})">
                        📧
                    </button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'present': 'Présent',
            'absent': 'Absent',
            'justified': 'Justifié'
        };
        return statusMap[status] || status;
    }

    updateStatus(studentId, newStatus) {
        const filiere = currentConfig.filiere;
        const students = MOCK_DATA.students[filiere];
        const student = students.find(s => s.id === studentId);
        
        if (student) {
            student.status = newStatus;
            this.renderStudentTable(students);
            Helpers.showNotification(`${student.prenom} ${student.nom} : ${this.getStatusText(newStatus)}`, 'success');
        }
    }

    markAllPresent() {
        const filiere = currentConfig.filiere;
        const students = MOCK_DATA.students[filiere];
        
        students.forEach(student => {
            if (student.status !== 'justified') {
                student.status = 'present';
            }
        });
        
        this.renderStudentTable(students);
        Helpers.showNotification('Tous les étudiants sont marqués présents', 'success');
    }

    sendMessageToAbsents() {
        const filiere = currentConfig.filiere;
        const students = MOCK_DATA.students[filiere];
        const absents = students.filter(s => s.status === 'absent');
        
        if (absents.length === 0) {
            Helpers.showNotification('Aucun étudiant absent', 'info');
            return;
        }
        
        // Simulation d'envoi de message
        const message = `Message envoyé à ${absents.length} étudiant(s) absent(s)`;
        Helpers.showNotification(message, 'success');
        
        // Afficher les destinataires dans la console
        console.log('Destinataires:', absents.map(s => s.email));
    }

    openJustificationPanel(studentId) {
        const filiere = currentConfig.filiere;
        const student = MOCK_DATA.students[filiere].find(s => s.id === studentId);
        
        if (student) {
            this.selectedStudent = student;
            document.getElementById('selected-student-name').textContent = 
                `Étudiant : ${student.prenom} ${student.nom} (${student.numero})`;
            
            this.justificationPanel.classList.remove('hidden');
            
            // Créer un overlay modal
            this.createModalOverlay();
        }
    }

    createModalOverlay() {
        let overlay = document.querySelector('.modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.onclick = () => this.closeJustificationPanel();
            document.body.appendChild(overlay);
        }
    }

    closeJustificationPanel() {
        this.justificationPanel.classList.add('hidden');
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
        this.selectedStudent = null;
    }

    saveJustification() {
        if (!this.selectedStudent) return;
        
        const motif = document.getElementById('motif-absence').value;
        const commentaire = document.getElementById('commentaire').value;
        const pieceJointe = document.getElementById('piece-jointe').files[0];
        
        // Créer une nouvelle justification
        const justification = {
            id: Helpers.generateId(),
            studentId: this.selectedStudent.id,
            date: new Date().toISOString().split('T')[0],
            motif: this.getMotifText(motif),
            commentaire: commentaire,
            pieceJointe: pieceJointe ? pieceJointe.name : null,
            status: 'valide'
        };
        
        // Ajouter aux absences justifiées
        MOCK_DATA.justifiedAbsences.push(justification);
        
        // Mettre à jour le statut de l'étudiant
        this.updateStatus(this.selectedStudent.id, 'justified');
        
        // Fermer le panneau
        this.closeJustificationPanel();
        
        Helpers.showNotification('Justification enregistrée avec succès', 'success');
    }

    getMotifText(motifCode) {
        const motifs = {
            'maladie': 'Maladie (Certificat médical)',
            'familial': 'Raison familiale',
            'transport': 'Problème de transport',
            'stage': 'Stage / Concours',
            'autre': 'Autre'
        };
        return motifs[motifCode] || motifCode;
    }

    sendIndividualMessage(studentId) {
        const filiere = currentConfig.filiere;
        const student = MOCK_DATA.students[filiere].find(s => s.id === studentId);
        
        if (student) {
            Helpers.showNotification(`Message envoyé à ${student.prenom} ${student.nom}`, 'success');
            console.log(`Email envoyé à: ${student.email}`);
        }
    }

    searchStudents(searchTerm) {
        const filiere = currentConfig.filiere;
        const students = MOCK_DATA.students[filiere] || [];
        
        if (!searchTerm) {
            this.renderStudentTable(students);
            return;
        }
        
        const filtered = Helpers.searchInArray(students, searchTerm, ['nom', 'prenom', 'numero']);
        this.renderStudentTable(filtered);
    }
}

// Exposer la méthode close pour le bouton de fermeture
window.closeJustificationPanel = () => {
    if (window.saisieModule) {
        window.saisieModule.closeJustificationPanel();
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.saisieModule = new SaisieModule();
});
