// Data Management (API-based)
class DataManager {
    static API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : '/api';

    static getToken() {
        return localStorage.getItem('gbayeurs_token');
    }

    static getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }

    static async get(key) {
        try {
            const response = await fetch(`${this.API_URL}/${key}`, {
                headers: this.getHeaders()
            });
            if (response.status === 401 || response.status === 403) {
                App.logout();
                throw new Error('Session expirée');
            }
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors du chargement de ${key}:`, error);
            return [];
        }
    }

    static async add(key, item) {
        try {
            const response = await fetch(`${this.API_URL}/${key}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(item)
            });
            if (response.status === 401 || response.status === 403) App.logout();
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de l'ajout dans ${key}:`, error);
        }
    }

    static async remove(key, id) {
        try {
            const response = await fetch(`${this.API_URL}/${key}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (response.status === 401 || response.status === 403) App.logout();
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la suppression dans ${key}:`, error);
        }
    }

    static async login(identifiant, password) {
        const response = await fetch(`${this.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiant, password })
        });
        return await response.json();
    }

    static async registerTeacher(data) {
        const response = await fetch(`${this.API_URL}/register/teacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}


// App Controller
const App = {
    init() {
        this.navLinks = document.querySelectorAll('.nav-link[data-module]');
        this.views = document.querySelectorAll('.view');
        this.moduleTitle = document.getElementById('module-title');
        this.moduleSubtitle = document.getElementById('module-subtitle');
        this.user = JSON.parse(localStorage.getItem('gbayeurs_user') || 'null');

        // Create toast container
        if (!document.querySelector('.toast-container')) {
            const tc = document.createElement('div');
            tc.className = 'toast-container';
            document.body.appendChild(tc);
        }

        this.bindEvents();
        this.checkAuth();
    },

    async initRecherche() {
        const results = document.getElementById('search-results');
        if (results) {
            results.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><p>Commencez à taper un nom pour rechercher un étudiant...</p></div>';
        }
    },

    async handleSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        if (query.length < 2) {
            resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><p>Commencez à taper un nom pour rechercher un étudiant...</p></div>';
            return;
        }
        const students = await DataManager.get(`search/students?q=${query}`);
        
        if (students.length === 0) {
            resultsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);"><p>Aucun étudiant trouvé.</p></div>';
            return;
        }

        resultsContainer.innerHTML = students.map(s => `
            <div class="glass-card" style="border-top: 4px solid var(--primary);">
                <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 1.5rem;">
                    <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700;">
                        ${s.nom[0]}${s.prenom[0]}
                    </div>
                    <div>
                        <h4 style="font-size: 1.1rem;">${s.nom} ${s.prenom}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">${s.libelle_filiere}</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 10px; text-align: center;">
                        <p style="font-size: 0.7rem; color: var(--danger); text-transform: uppercase; font-weight: 700;">Absences</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${s.nb_absences}</p>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 10px; text-align: center;">
                        <p style="font-size: 0.7rem; color: var(--success); text-transform: uppercase; font-weight: 700;">Justifiées</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${s.nb_justifiees}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    checkAuth() {
        if (this.user) {
            document.getElementById('login-overlay').classList.add('hidden');
            document.getElementById('app-wrapper').classList.remove('hidden');
            this.applyRoleRestrictions();
            this.loadModule('dashboard');
            this.updateUserProfile();
        } else {
            document.getElementById('login-overlay').classList.remove('hidden');
            document.getElementById('app-wrapper').classList.add('hidden');
        }
    },

    showLoginError(message) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) errorEl.textContent = message;
        this.showToast(message, 'error');
    },

    clearLoginError() {
        const errorEl = document.getElementById('login-error');
        if (errorEl) errorEl.textContent = '';
    },

    showRegisterError(message) {
        const errorEl = document.getElementById('register-error');
        if (errorEl) errorEl.textContent = message;
        this.showToast(message, 'error');
    },

    clearRegisterError() {
        const errorEl = document.getElementById('register-error');
        if (errorEl) errorEl.textContent = '';
    },

    setLoginButtonState(enabled) {
        const button = document.getElementById('login-submit');
        if (button) {
            button.disabled = !enabled;
            button.textContent = enabled ? 'Se Connecter' : 'Connexion...';
        }
    },

    setRegisterButtonState(enabled) {
        const button = document.querySelector('#register-form button[type="submit"]');
        if (button) {
            button.disabled = !enabled;
            button.textContent = enabled ? 'Créer mon compte' : 'Création...';
        }
    },

    togglePasswordVisibility(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        if (!input || !button) return;
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = 'Masquer';
        } else {
            input.type = 'password';
            button.textContent = 'Afficher';
        }
    },

    updateUserProfile() {
        const container = document.querySelector('.user-profile');
        if (container && this.user) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); padding: 5px 15px; border-radius: 50px; border: 1px solid var(--border);">
                    <div style="text-align: right;">
                        <p style="font-size: 0.85rem; font-weight: 600;">${this.user.nom_complet || this.user.identifiant}</p>
                        <p style="font-size: 0.7rem; color: var(--primary); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">${this.user.role}</p>
                    </div>
                    <div style="width: 35px; height: 35px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                        ${this.user.identifiant.charAt(0).toUpperCase()}
                    </div>
                </div>
            `;
        }
    },

    applyRoleRestrictions() {
        const role = this.user.role;
        // Seul l'admin voit Paramétrage
        const paramLink = document.querySelector('[data-module="parametrage"]');
        if (paramLink) {
            if (role !== 'admin') paramLink.classList.add('hidden');
            else paramLink.classList.remove('hidden');
        }

        // Si enseignant, cacher Édition (optionnel selon besoin)
        const editionLink = document.querySelector('[data-module="edition"]');
        if (editionLink) {
            if (role === 'enseignant') editionLink.classList.add('hidden');
            else editionLink.classList.remove('hidden');
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        this.clearLoginError();

        const identifiantEl = document.getElementById('login-id');
        const passwordEl = document.getElementById('login-pass');
        const identifiant = identifiantEl?.value.trim();
        const password = passwordEl?.value;

        if (!identifiant) return this.showLoginError('Veuillez saisir votre identifiant.');
        if (!password) return this.showLoginError('Veuillez saisir votre mot de passe.');

        this.setLoginButtonState(false);
        try {
            const result = await DataManager.login(identifiant, password);
            if (result.token) {
                localStorage.setItem('gbayeurs_token', result.token);
                localStorage.setItem('gbayeurs_user', JSON.stringify(result.user));
                this.user = result.user;
                this.showToast(`Bienvenue, ${result.user.nom_complet || result.user.identifiant}`, 'success');
                this.checkAuth();
            } else {
                this.showLoginError(result.error || 'Identifiant ou mot de passe incorrect.');
            }
        } catch (error) {
            this.showLoginError('Erreur lors de la connexion.');
            console.error('Login error:', error);
        } finally {
            this.setLoginButtonState(true);
        }
    },

    async handleRegisterTeacher(e) {
        e.preventDefault();
        this.clearRegisterError();

        const nom = document.getElementById('reg-nom').value.trim();
        const prenom = document.getElementById('reg-prenom').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const specialite = document.getElementById('reg-specialite').value.trim();
        const sexe = document.getElementById('reg-sexe').value;
        const identifiant = document.getElementById('reg-id').value.trim();
        const password = document.getElementById('reg-pass').value;

        if (!nom || !prenom || !email || !specialite || !identifiant || !password) {
            return this.showRegisterError('Veuillez remplir tous les champs obligatoires.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return this.showRegisterError('Veuillez saisir une adresse email valide.');
        }
        if (password.length < 6) {
            return this.showRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
        }

        const data = { nom, prenom, email, specialite, sexe, identifiant, password };
        this.setRegisterButtonState(false);

        try {
            const result = await DataManager.registerTeacher(data);
            if (result.token) {
                localStorage.setItem('gbayeurs_token', result.token);
                localStorage.setItem('gbayeurs_user', JSON.stringify(result.user));
                this.user = result.user;
                this.showToast('Inscription réussie ! Bienvenue.', 'success');
                this.checkAuth();
            } else {
                this.showRegisterError(result.error || 'Erreur lors de l\'inscription.');
            }
        } catch (error) {
            this.showRegisterError('Erreur serveur lors de l\'inscription.');
            console.error('Register error:', error);
        } finally {
            this.setRegisterButtonState(true);
        }
    },

    logout() {
        localStorage.removeItem('gbayeurs_token');
        localStorage.removeItem('gbayeurs_user');
        this.user = null;
        this.checkAuth();
    },

    async validateAttendance() {
        const filterMajor = document.getElementById('filter-major').value;
        const filterTeacher = document.getElementById('filter-teacher').value;
        const code_matiere = document.getElementById('detected-subject-code').value;
        const id_periode = document.getElementById('detected-period-id').value;

        if (!filterTeacher) return this.showToast('Veuillez sélectionner un enseignant.', 'error');
        if (!filterMajor) return this.showToast('Veuillez sélectionner une filière pour valider l\'appel.', 'error');
        if (!code_matiere || !id_periode) return this.showToast('Impossible de valider : Matière non détectée pour ce professeur.', 'error');

        const rows = document.querySelectorAll('#attendance-list tr');
        const absents = [];

        rows.forEach(row => {
            const statusBadge = row.querySelector('span[id^="status-"]');
            if (statusBadge && statusBadge.innerText.trim() === 'Absent') {
                const studentId = statusBadge.id.replace('status-', '');
                absents.push(parseInt(studentId));
            }
        });

        const attendanceRecord = {
            date: new Date().toISOString(),
            code_filiere: filterMajor,
            code_matiere: code_matiere,
            id_enseignant: parseInt(filterTeacher),
            id_periode: parseInt(id_periode),
            absents: absents
        };

        await DataManager.add('attendance', attendanceRecord);
        this.showToast(`${absents.length} absence(s) enregistrée(s).`, 'success');
        
        // Rafraîchir uniquement la liste actuelle au lieu de repartir au dashboard
        await this.renderAttendance();
        // Optionnel : On peut rester ici ou aller voir les justifications
    },

    // --- Module: Justifications ---
    async initJustification() {
        const absences = await DataManager.get('absences-to-justify');
        const justifications = await DataManager.get('justifications');
        const container = document.getElementById('absences-to-justify');

        if (absences.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding: 3rem; grid-column: 1/-1;"><p style="color: var(--text-muted);">Aucune absence n\'a été enregistrée pour le moment.</p></div>';
            return;
        }

        let html = '';
        absences.forEach(abs => {
            const justification = justifications.find(j => j.id_etudiant == abs.id_etudiant && j.id_enseignement == abs.id_enseignement);
            
            const studentName = `${abs.nom} ${abs.prenom}`;
            const dateStr = abs.date_seance ? new Date(abs.date_seance).toLocaleDateString('fr-FR') : 'Date inconnue';

            html += `
                <div class="glass-card" style="border-left: 4px solid ${justification ? 'var(--success)' : 'var(--danger)'}; position: relative; overflow: hidden;">
                    ${justification ? `<div style="position: absolute; top: 0; right: 0; background: var(--success); color: white; padding: 5px 12px; font-size: 0.65rem; font-weight: 700; border-bottom-left-radius: 12px;">JUSTIFIÉ</div>` : ''}
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h4 style="font-size: 1.05rem; margin-bottom: 0.25rem;">${studentName}</h4>
                                <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px;">
                                    <i data-lucide="layers" style="width: 12px;"></i> ${abs.libelle_filiere}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">Le ${dateStr}</p>
                                <p style="font-size: 0.75rem; color: var(--primary); font-weight: 600; margin-top: 2px;">${abs.nom_matiere}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${justification ? 
                        `<div style="background: rgba(16, 185, 129, 0.08); padding: 15px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;">
                                <i data-lucide="check-circle" style="color: var(--success); width: 18px; margin-top: 2px;"></i>
                                <div>
                                    <p style="font-size: 0.9rem; color: var(--text-main); font-weight: 600; margin-bottom: 4px;">${justification.motif}</p>
                                    ${justification.commentaire ? `<p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">"${justification.commentaire}"</p>` : ''}
                                </div>
                            </div>
                            <button class="btn" style="margin-top: 15px; background: transparent; color: var(--danger); border: 1px solid var(--danger); padding: 0.4rem 0.8rem; font-size: 0.75rem; width: 100%;" 
                                onclick="App.removeJustification(${justification.id})">Supprimer la justification</button>
                         </div>` : 
                        `<div>
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label class="form-label" style="font-size: 0.75rem;">Motif de l'absence</label>
                                <input type="text" id="motif-${abs.id_enseignement}-${abs.id_etudiant}" class="form-input" placeholder="Ex: Certificat médical, RDV..." style="padding: 0.6rem; font-size: 0.85rem; background: rgba(255,255,255,0.03);">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label class="form-label" style="font-size: 0.75rem;">Commentaire (optionnel)</label>
                                <textarea id="comment-${abs.id_enseignement}-${abs.id_etudiant}" class="form-input" placeholder="Détails supplémentaires..." style="padding: 0.6rem; font-size: 0.85rem; background: rgba(255,255,255,0.03); resize: none; height: 60px;"></textarea>
                            </div>
                            <button class="btn btn-primary" style="padding: 0.75rem; width: 100%; font-size: 0.85rem; justify-content: center;" 
                                onclick="App.saveJustification(${abs.id_enseignement}, ${abs.id_etudiant})">
                                <i data-lucide="check" style="width: 16px;"></i> Valider la justification
                            </button>
                         </div>`
                    }
                </div>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();
    },

    async saveJustification(attendanceId, studentId) {
        const motif = document.getElementById(`motif-${attendanceId}-${studentId}`).value;
        const commentaire = document.getElementById(`comment-${attendanceId}-${studentId}`).value;

        if (!motif) return this.showToast('Veuillez saisir un motif.', 'error');

        const justification = {
            attendanceId: attendanceId,
            studentId: studentId,
            motif: motif,
            commentaire: commentaire,
            date: new Date().toISOString()
        };

        await DataManager.add('justifications', justification);
        this.showToast('Absence justifiée avec succès.', 'success');
        await this.initJustification();
    },

    async removeJustification(id) {
        await DataManager.remove('justifications', id);
        this.showToast('Justification supprimée.', 'success');
        await this.initJustification();
    },

    showToast(message, type = 'error') {
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'error' ? 'alert-circle' : 'check-circle';
        toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    bindEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = link.getAttribute('data-module');
                console.log('Navigation vers :', module);
                this.loadModule(module);
            });
        });

        const showRegisterBtn = document.getElementById('show-register-btn');
        const showLoginBtn = document.getElementById('show-login-btn');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleLoginPass = document.getElementById('toggle-login-pass');
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            });
        }
        if (toggleLoginPass) {
            toggleLoginPass.addEventListener('click', () => this.togglePasswordVisibility('login-pass', 'toggle-login-pass'));
        }
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginError('Contactez l\'administrateur pour réinitialiser votre mot de passe.');
            });
        }
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterTeacher(e));
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    },

    async loadModule(moduleName) {
        try {
            console.log('Chargement du module :', moduleName);
            this.views.forEach(view => view.classList.add('hidden'));
            const targetView = document.getElementById(`${moduleName}-view`);
            if (targetView) targetView.classList.remove('hidden');

            // Update active state in sidebar
            this.navLinks.forEach(l => {
                if (l.getAttribute('data-module') === moduleName) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });

            const titles = {
                dashboard: { title: 'Dashboard', subtitle: 'Bienvenue sur Gbayeurs.' },
                parametrage: { title: 'Paramétrage', subtitle: 'Configurez les bases de votre établissement.' },
                saisie: { title: 'Saisie & Appel', subtitle: 'Enregistrez les étudiants et gérez les présences.' },
                edition: { title: 'Édition & Rapports', subtitle: 'Consultez et exportez vos données.' },
                justification: { title: 'Justifications', subtitle: 'Gérez les motifs d\'absence des étudiants.' },
                recherche: { title: 'Recherche Étudiant', subtitle: 'Consultez le dossier complet d\'un élève.' }
            };

            if (titles[moduleName]) {
                this.moduleTitle.innerText = titles[moduleName].title;
                this.moduleSubtitle.innerText = titles[moduleName].subtitle;
            }

            if (moduleName === 'dashboard') await this.initDashboard();
            if (moduleName === 'parametrage') await this.initParametrage();
            if (moduleName === 'saisie') await this.initSaisie();
            if (moduleName === 'edition') await this.initEdition();
            if (moduleName === 'justification') await this.initJustification();
            if (moduleName === 'recherche') await this.initRecherche();

            console.log('Module chargé avec succès.');
        } catch (error) {
            console.error('Erreur lors du chargement du module :', error);
            this.showToast('Erreur de chargement du module. Vérifiez la console.', 'error');
        }
    },

    // --- Module: Dashboard ---
    async initDashboard() {
        const students = await DataManager.get('students');
        const teachers = await DataManager.get('teachers');
        const majors = await DataManager.get('majors');
        const subjects = await DataManager.get('subjects');

        // Render Stats
        const statsGrid = document.getElementById('stats-grid');
        const stats = [
            { label: 'Étudiants', value: students.length, icon: 'users', color: 'var(--primary)' },
            { label: 'Enseignants', value: teachers.length, icon: 'user-check', color: 'var(--success)' },
            { label: 'Filières', value: majors.length, icon: 'layers', color: 'var(--secondary)' },
            { label: 'Matières', value: subjects.length, icon: 'book', color: 'var(--warning)' }
        ];

        statsGrid.innerHTML = stats.map(s => `
            <div class="glass-card" style="border-left: 4px solid ${s.color};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">${s.label}</p>
                        <h3 style="font-size: 1.8rem; font-weight: 700;">${s.value}</h3>
                    </div>
                    <div style="background: ${s.color}20; padding: 10px; border-radius: 10px; color: ${s.color};">
                        <i data-lucide="${s.icon}"></i>
                    </div>
                </div>
            </div>
        `).join('');

        // Render Recent Students (Last 5)
        const recentList = document.getElementById('recent-students-list');
        const recent = [...students].reverse().slice(0, 5);

        recentList.innerHTML = recent.map(s => {
            const majorName = majors.find(m => m.code_filiere == s.code_filiere)?.libelle_filiere || 'N/A';
            return `
                <li style="display: flex; align-items: center; gap: 15px; padding: 1rem 0; border-bottom: 1px solid var(--border);">
                    <div style="width: 40px; height: 40px; background: var(--card-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--primary);">
                        ${s.nom[0]}${s.prenom[0]}
                    </div>
                    <div>
                        <p style="font-weight: 500; font-size: 0.9rem;">${s.nom} ${s.prenom}</p>
                        <p style="color: var(--text-muted); font-size: 0.75rem;">${majorName}</p>
                    </div>
                </li>
            `;
        }).join('') || '<p style="padding: 1rem; color: var(--text-muted);">Aucune inscription récente.</p>';

        lucide.createIcons();
        this.renderCharts();
    },

    async renderCharts() {
        const byMajorData = await DataManager.get('stats/absences-by-major');
        const byDayData = await DataManager.get('stats/absences-by-day');

        // Chart 1: Absences by Major
        const canvasMajor = document.getElementById('chart-absences-filiere');
        if (!canvasMajor) return;
        const ctxMajor = canvasMajor.getContext('2d');
        if (this.chartMajor) this.chartMajor.destroy();
        this.chartMajor = new Chart(ctxMajor, {
            type: 'bar',
            data: {
                labels: byMajorData.map(d => d.libelle_filiere),
                datasets: [{
                    label: 'Nombre d\'absences',
                    data: byMajorData.map(d => d.total),
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // Chart 2: Weekly Evolution
        const canvasEvolution = document.getElementById('chart-evolution-absences');
        if (!canvasEvolution) return;
        const ctxEvolution = canvasEvolution.getContext('2d');
        if (this.chartEvolution) this.chartEvolution.destroy();
        this.chartEvolution = new Chart(ctxEvolution, {
            type: 'line',
            data: {
                labels: byDayData.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
                datasets: [{
                    label: 'Absences',
                    data: byDayData.map(d => d.total),
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#ec4899'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    },

    // --- Module: Paramétrage (Refactored to Forms/Tabs) ---
    async initParametrage() {
        const container = document.getElementById('parametrage-view');
        container.innerHTML = `
            <div class="tabs-header">
                <button class="tab-btn active" onclick="App.renderTab('periods')">Périodes</button>
                <button class="tab-btn" onclick="App.renderTab('majors')">Filières</button>
                <button class="tab-btn" onclick="App.renderTab('subjects')">Matières & Programme</button>
                <button class="tab-btn" onclick="App.renderTab('teachers')">Enseignants</button>
            </div>
            <div id="tab-content"></div>
        `;
        await this.renderTab('periods');
    },

    async renderTab(tabName) {
        // Update active state
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.innerText.toLowerCase().includes(tabName === 'planning' ? 'affectations' : tabName === 'subjects' ? 'matières' : tabName));
        });

        const content = document.getElementById('tab-content');
        let html = '';

        if (tabName === 'periods') {
            html = `
                <div class="form-container">
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Définir une Période</h3>
                        <div class="form-group">
                            <label class="form-label">Libellé (ex: Semestre 1)</label>
                            <input type="text" id="p-libelle" class="form-input" placeholder="Libellé">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date de début</label>
                            <input type="date" id="p-debut" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date de fin</label>
                            <input type="date" id="p-fin" class="form-input">
                        </div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="App.addPeriod()">Enregistrer la Période</button>
                    </div>
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Périodes existantes</h3>
                        <ul id="period-list" class="entity-list scrollable-list"></ul>
                    </div>
                </div>
            `;
        } else if (tabName === 'subjects') {
            const subjects = await DataManager.get('subjects');
            const majors = await DataManager.get('majors');
            const teachers = await DataManager.get('teachers');
            const periods = await DataManager.get('periods');

            html = `
                <div class="form-container">
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Ajouter une Matière</h3>
                        <div class="form-group">
                            <input type="text" id="m-code" class="form-input" placeholder="Code (ex: ALGO-101)" style="margin-bottom: 0.5rem;">
                            <input type="text" id="m-nom" class="form-input" placeholder="Nom de la matière">
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 2rem;" onclick="App.addSubject()">Ajouter au Catalogue</button>

                        <h3 style="margin-bottom: 1.5rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">Programme & Affectations</h3>
                        <div class="form-group">
                            <label class="form-label">Matière</label>
                            <select id="c-matiere" class="form-input">
                                ${subjects.map(s => `<option value="${s.code_matiere}">${s.nom_matiere}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Filière</label>
                            <select id="c-filiere" class="form-input">
                                ${majors.map(m => `<option value="${m.code_filiere}">${m.libelle_filiere} (${m.niveau})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Enseignant</label>
                            <select id="c-enseignant" class="form-input">
                                ${teachers.map(t => `<option value="${t.id_enseignant}">${t.nom} ${t.prenom}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Période</label>
                            <select id="c-periode" class="form-input">
                                ${periods.map(p => `<option value="${p.id_periode}">${p.libelle}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Volume Horaire (heures)</label>
                            <input type="number" id="c-volume" class="form-input" placeholder="Ex: 40">
                        </div>
                        <button class="btn" style="width: 100%; background: var(--secondary); color: white; border: none;" onclick="App.addCorrespondance()">Enregistrer le Programme</button>
                    </div>
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Catalogue & Programme Complet</h3>
                        <div style="margin-bottom: 1rem;">
                            <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Matières enregistrées</h4>
                            <ul id="subject-list" class="entity-list scrollable-list" style="margin-bottom: 2rem;"></ul>
                        </div>
                        <div>
                            <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Détails du Programme (Affectations)</h4>
                            <ul id="correspondance-list" class="entity-list scrollable-list"></ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (tabName === 'teachers') {
            html = `
                <div class="form-container">
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Fiche Enseignant</h3>
                        <div class="form-group">
                            <input type="text" id="e-nom" class="form-input" placeholder="Nom" style="margin-bottom:0.5rem">
                            <input type="text" id="e-prenom" class="form-input" placeholder="Prénom" style="margin-bottom:0.5rem">
                            <input type="email" id="e-mail" class="form-input" placeholder="Email (crucial pour notification)" style="margin-bottom:0.5rem">
                            <input type="text" id="e-spec" class="form-input" placeholder="Spécialité">
                        </div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="App.addTeacher()">Enregistrer l'Enseignant</button>
                    </div>
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Corps Professoral</h3>
                        <ul id="teacher-list" class="entity-list scrollable-list"></ul>
                    </div>
                </div>
            `;
        } else if (tabName === 'majors') {
            html = `
                <div class="form-container">
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Nouvelle Filière</h3>
                        <div class="form-group">
                            <input type="text" id="f-code" class="form-input" placeholder="Code (ex: INFO)" style="margin-bottom:0.5rem">
                            <input type="text" id="f-lib" class="form-input" placeholder="Nom de la filière (ex: Informatique)" style="margin-bottom:0.5rem">
                            <select id="f-niv" class="form-input" style="margin-bottom:0.5rem">
                                <option value="">-- Sélectionner le Niveau --</option>
                                <option value="Licence 1">Licence 1</option>
                                <option value="Licence 2">Licence 2</option>
                                <option value="Licence 3">Licence 3</option>
                                <option value="Master 1">Master 1</option>
                                <option value="Master 2">Master 2</option>
                            </select>
                            <input type="number" id="f-nbre" class="form-input" placeholder="Nombre d'étudiants">
                        </div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="App.addMajor()">Ajouter la Filière</button>
                    </div>
                    <div class="glass-card">
                        <h3 style="margin-bottom: 1.5rem;">Liste des Filières</h3>
                        <ul id="major-list" class="entity-list scrollable-list"></ul>
                    </div>
                </div>
            `;
        } else if (tabName === 'planning') {
            const teachers = await DataManager.get('teachers');
            const majors = await DataManager.get('majors');
            const subjects = await DataManager.get('subjects');
            const periods = await DataManager.get('periods');

            html = `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1.5rem;">Affectations (Qui enseigne quoi ?)</h3>
                    <div style="display: flex; gap: 10px; margin-bottom: 1rem; flex-wrap: wrap;">
                        <select id="a-enseignant" class="form-input" style="flex: 1; min-width: 150px;">
                            <option value="">-- Enseignant --</option>
                            ${teachers.map(t => `<option value="${t.id_enseignant}">${t.nom} ${t.prenom}</option>`).join('')}
                        </select>
                        <select id="a-filiere" class="form-input" style="flex: 1; min-width: 150px;">
                            <option value="">-- Filière --</option>
                            ${majors.map(m => `<option value="${m.code_filiere}">${m.libelle_filiere}</option>`).join('')}
                        </select>
                        <select id="a-matiere" class="form-input" style="flex: 1; min-width: 150px;">
                            <option value="">-- Matière --</option>
                            ${subjects.map(s => `<option value="${s.code_matiere}">${s.nom_matiere}</option>`).join('')}
                        </select>
                        <select id="a-periode" class="form-input" style="flex: 1; min-width: 150px;">
                            <option value="">-- Période --</option>
                            ${periods.map(p => `<option value="${p.id_periode}">${p.libelle}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="App.addAffectation()">Créer l'Affectation</button>
                    <ul id="affectation-list" class="entity-list scrollable-list" style="margin-top: 1.5rem;"></ul>
                </div>
            `;
        }

        content.innerHTML = html;

        // Render lists for the active tab
        if (tabName === 'periods') await this.renderList('periods', 'period-list');
        if (tabName === 'subjects') {
            await this.renderList('subjects', 'subject-list');
            await this.renderList('correspondances', 'correspondance-list');
        }
        if (tabName === 'teachers') await this.renderList('teachers', 'teacher-list');
        if (tabName === 'majors') await this.renderList('majors', 'major-list');
        if (tabName === 'planning') await this.renderList('affectations', 'affectation-list');

        lucide.createIcons();
    },

    async addEntity(key, obj, listId) {
        if (Object.values(obj).every(v => v && v.toString().trim() !== '')) {
            await DataManager.add(key, obj);
            await this.renderList(key, listId);
            this.showToast('Enregistré avec succès', 'success');
            // On ne touche pas au Dashboard ici pour ne pas perturber la vue
        } else {
            this.showToast('Erreur : Veuillez remplir tous les champs avant de valider.', 'error');
        }
    },

    async addPeriod() {
        const libelle = document.getElementById('p-libelle').value;
        const debut = document.getElementById('p-debut').value;
        const fin = document.getElementById('p-fin').value;

        if (!libelle || !debut || !fin) return this.showToast('Informations manquantes pour la période.', 'error');

        if (new Date(fin) < new Date(debut)) {
            return this.showToast('La date de fin ne peut pas être avant le début.', 'error');
        }

        await this.addEntity('periods', { libelle: libelle, date_debut: debut, date_fin: fin }, 'period-list');
    },

    async addTeacher() {
        const nom = document.getElementById('e-nom').value;
        const prenom = document.getElementById('e-prenom').value;
        const mail = document.getElementById('e-mail').value;
        const spec = document.getElementById('e-spec').value;

        if (!nom || !prenom || !mail || !spec) return this.showToast('Veuillez renseigner tous les détails de l\'enseignant.', 'error');

        const obj = { nom: nom, prenom: prenom, email: mail, specialite: spec };
        await this.addEntity('teachers', obj, 'teacher-list');
    },

    async addMajor() {
        const code = document.getElementById('f-code').value;
        const lib = document.getElementById('f-lib').value;
        const niv = document.getElementById('f-niv').value;
        const nbre = document.getElementById('f-nbre').value;

        if (!code || !lib || !niv || !nbre) return this.showToast('Veuillez compléter toutes les informations de la filière (Code, Nom, Niveau, Effectif).', 'error');

        // Check for duplicate
        const majors = await DataManager.get('majors');
        if (majors.find(m => m.code_filiere == code)) {
            return this.showToast('Erreur : Ce code de filière existe déjà.', 'error');
        }

        const obj = { code_filiere: code, libelle_filiere: lib, niveau: niv, nombre_etudiants: nbre };
        await this.addEntity('majors', obj, 'major-list');
    },

    async addSubject() {
        const code = document.getElementById('m-code').value;
        const nom = document.getElementById('m-nom').value;

        if (!code || !nom) return this.showToast('Veuillez renseigner le code et le nom de la matière.', 'error');

        const subjects = await DataManager.get('subjects');
        if (subjects.find(s => s.code_matiere == code)) {
            return this.showToast('Erreur : Ce code de matière existe déjà.', 'error');
        }

        const obj = { code_matiere: code, nom_matiere: nom };
        await this.addEntity('subjects', obj, 'subject-list');
    },


    async addCorrespondance() {
        const code_filiere = document.getElementById('c-filiere').value;
        const code_matiere = document.getElementById('c-matiere').value;
        const id_enseignant = document.getElementById('c-enseignant').value;
        const id_periode = document.getElementById('c-periode').value;
        const volume = document.getElementById('c-volume').value;

        if (!code_filiere || !code_matiere || !id_enseignant || !id_periode || !volume) {
            return this.showToast('Veuillez remplir tous les champs du programme.', 'error');
        }

        // Save Correspondence (MCD: CORRESPONDRE)
        const corrObj = { code_filiere, code_matiere, volume_horaire: parseInt(volume) };
        await DataManager.add('correspondances', corrObj);

        // Save Affectation (MCD: ENSEIGNEMENT / Affectation)
        const affObj = {
            id_enseignant: parseInt(id_enseignant),
            code_filiere: code_filiere,
            code_matiere: code_matiere,
            id_periode: parseInt(id_periode)
        };
        await DataManager.add('affectations', affObj);

        await this.renderList('correspondances', 'correspondance-list');
        this.showToast('Programme et affectation enregistrés.', 'success');
    },

    async renderList(key, listId) {
        const list = document.getElementById(listId);
        const data = await DataManager.get(key) || [];
        const teachers = await DataManager.get('teachers');
        const majors = await DataManager.get('majors');
        const subjects = await DataManager.get('subjects');
        const periods = await DataManager.get('periods');
        const affectations = await DataManager.get('affectations');

        const getLabel = (i) => {
            if (i.id_affectation) {
                const prof = teachers.find(t => t.id_enseignant == i.id_enseignant);
                const fil = majors.find(f => f.code_filiere == i.code_filiere);
                const mat = subjects.find(s => s.code_matiere == i.code_matiere);
                const per = periods.find(p => p.id_periode == i.id_periode);
                return `<strong style="color:var(--primary);">${prof?.nom || '?'}</strong> - ${fil?.libelle_filiere || '?'} - ${mat?.nom_matiere || '?'} <br><small style="color:var(--text-muted);">${per?.libelle || '?'}</small>`;
            }
            if (key === 'correspondances') {
                const fil = majors.find(f => f.code_filiere == i.code_filiere);
                const mat = subjects.find(s => s.code_matiere == i.code_matiere);
                const aff = (affectations || []).find(a => a.code_filiere == i.code_filiere && a.code_matiere == i.code_matiere);
                const prof = aff ? teachers.find(t => t.id_enseignant == aff.id_enseignant) : null;
                const per = aff ? periods.find(p => p.id_periode == aff.id_periode) : null;

                return `
                    <div style="border-bottom: 1px solid var(--border); padding: 8px 0;">
                        <strong>${mat?.nom_matiere || '?'}</strong> (${i.volume_horaire}h) <br>
                        <small style="color:var(--text-muted);">${fil?.libelle_filiere || '?'} - ${fil?.niveau || '?'}</small> <br>
                        <small style="color:var(--primary); font-weight:600;">Prof: ${prof?.nom || '?'}</small> | 
                        <small style="color:var(--text-muted);">${per?.libelle || '?'}</small>
                    </div>
                `;
            }
            if (i.libelle_filiere) return `${i.libelle_filiere} - <span style="color:var(--primary); font-weight:700;">${i.niveau || 'N/A'}</span>`;
            if (i.nom_matiere) return i.nom_matiere;
            if (i.nom && i.prenom) return `${i.nom} ${i.prenom}`;
            if (i.libelle) return i.libelle;
            return JSON.stringify(i);
        };
        const getIdField = (k) => {
            if (k === 'majors') return 'code_filiere';
            if (k === 'subjects') return 'code_matiere';
            if (k === 'teachers') return 'id_enseignant';
            if (k === 'affectations') return 'id_affectation';
            if (k === 'correspondances') return 'code_matiere'; // Simplified for delete
            if (k === 'students') return 'id_etudiant';
            return 'id_periode';
        };

        list.innerHTML = data.map(item => {
            const idValue = item[getIdField(key)];
            return `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.85rem;">
                    ${getLabel(item)}
                    <i data-lucide="trash-2" style="width: 14px; cursor: pointer; color: var(--danger);" onclick="App.removeEntity('${key}', '${getIdField(key)}', '${idValue}', '${listId}')"></i>
                </li>
            `;
        }).join('');
        lucide.createIcons();
    },

    async removeEntity(key, idField, idValue, listId) {
        await DataManager.remove(key, idValue);
        await this.renderList(key, listId);
        this.showToast('Élément supprimé.', 'success');
    },

    // --- Module: Saisie ---
    async initSaisie() {
        const majors = await DataManager.get('majors');
        const teachers = await DataManager.get('teachers');
        const container = document.getElementById('saisie-view');
        container.innerHTML = `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <div class="glass-card" style="flex: 1; min-width: 350px;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Inscription Étudiant</h2>
                    <div class="form-group">
                        <input type="text" id="s-nom" class="form-input" placeholder="Nom" style="margin-bottom:0.5rem">
                        <input type="text" id="s-prenom" class="form-input" placeholder="Prénom">
                    </div>
                    <div class="form-group">
                        <select id="s-sexe" class="form-input">
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <select id="s-filiere" class="form-input">
                            ${majors.map(m => `<option value="${m.code_filiere}">${m.libelle_filiere} (${m.niveau || 'N/A'})</option>`).join('') || '<option>Aucune filière</option>'}
                        </select>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="App.registerStudent()">Inscrire</button>
                </div>

                <div class="glass-card" style="flex: 2; min-width: 450px;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Feuille de Présence</h2>
                    <div style="margin-bottom: 1.5rem; display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="filter-teacher" class="form-input" onchange="App.handleTeacherChange()" style="flex: 1;">
                            <option value="">Sélectionner l'Enseignant</option>
                            ${teachers.map(t => `<option value="${t.id_enseignant}">${t.nom} ${t.prenom}</option>`).join('')}
                        </select>
                        <select id="filter-major" class="form-input" onchange="App.renderAttendance(); App.updateDetectedSubject()" style="flex: 1;" disabled>
                            <option value="">Sélectionner la filière</option>
                        </select>
                    </div>
                    <div id="detection-zone" style="margin-bottom: 1rem; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid var(--border);">
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Matière détectée :</p> 
                        <strong id="detected-subject" style="color: var(--primary); font-size: 1rem;">---</strong>
                        <input type="hidden" id="detected-subject-code" value="">
                        <input type="hidden" id="detected-period-id" value="">
                    </div>
                    <div class="scrollable-list" style="min-height: 200px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tbody id="attendance-list"></tbody>
                        </table>
                    </div>
                    <button id="validate-attendance-btn" class="btn btn-primary" style="margin-top: 1.5rem; width: 100%; justify-content: center; opacity: 0.5;" onclick="App.validateAttendance()" disabled>
                        <i data-lucide="check-circle-2"></i> Valider l'appel
                    </button>
                </div>
            </div>
        `;
        await this.renderAttendance();
        lucide.createIcons();
    },

    async registerStudent() {
        const nom = document.getElementById('s-nom').value.trim();
        const prenom = document.getElementById('s-prenom').value.trim();
        const sexe = document.getElementById('s-sexe').value;
        const code_filiere = document.getElementById('s-filiere').value;

        if (!nom || !prenom || !code_filiere) {
            return this.showToast('Veuillez remplir le nom, le prénom et la filière de l\'étudiant.', 'error');
        }

        await DataManager.add('students', {
            nom: nom,
            prenom: prenom,
            sexe: sexe,
            code_filiere: code_filiere
        });

        document.getElementById('s-nom').value = '';
        document.getElementById('s-prenom').value = '';
        await this.renderAttendance();
        this.showToast(`Étudiant inscrit avec succès.`, 'success');
    },

    async handleTeacherChange() {
        const id_enseignant = document.getElementById('filter-teacher').value;
        const majorSelect = document.getElementById('filter-major');
        const subjectLabel = document.getElementById('detected-subject');
        const validateBtn = document.getElementById('validate-attendance-btn');

        // Reset
        majorSelect.innerHTML = '<option value="">Sélectionner la filière</option>';
        majorSelect.disabled = true;
        subjectLabel.innerText = "---";
        subjectLabel.style.color = "var(--primary)";
        if (validateBtn) {
            validateBtn.disabled = true;
            validateBtn.style.opacity = "0.5";
        }
        const attendanceList = document.getElementById('attendance-list');
        if (attendanceList) attendanceList.innerHTML = '';

        if (!id_enseignant) return;

        // Filter majors for this teacher based on affectations
        const affectations = await DataManager.get('affectations') || [];
        const teacherMajorsCodes = [...new Set(affectations
            .filter(a => a.id_enseignant == id_enseignant)
            .map(a => a.code_filiere))];

        const allMajors = await DataManager.get('majors');
        const teacherMajors = allMajors.filter(m => teacherMajorsCodes.includes(m.code_filiere));

        if (teacherMajors.length > 0) {
            majorSelect.disabled = false;
            teacherMajors.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.code_filiere;
                opt.innerText = `${m.libelle_filiere} (${m.niveau})`;
                majorSelect.appendChild(opt);
            });
        } else {
            this.showToast("Cet enseignant n'a aucune filière attribuée.", 'warning');
        }
    },

    async updateDetectedSubject() {
        const id_enseignant = document.getElementById('filter-teacher')?.value;
        const code_filiere = document.getElementById('filter-major')?.value;
        const subjectLabel = document.getElementById('detected-subject');
        const subjectCodeInput = document.getElementById('detected-subject-code');
        const periodIdInput = document.getElementById('detected-period-id');
        const validateBtn = document.getElementById('validate-attendance-btn');

        if (!subjectLabel) return;

        if (!id_enseignant || !code_filiere) {
            subjectLabel.innerText = "---";
            if (validateBtn) {
                validateBtn.disabled = true;
                validateBtn.style.opacity = "0.5";
            }
            return;
        }

        const today = new Date();
        const periods = await DataManager.get('periods') || [];
        const currentPeriod = periods.find(p => {
            const start = new Date(p.date_debut);
            const end = new Date(p.date_fin);
            end.setHours(23, 59, 59, 999);
            return today >= start && today <= end;
        });

        if (!currentPeriod) {
            subjectLabel.innerText = "Aucune période active aujourd'hui";
            subjectLabel.style.color = "var(--danger)";
            if (validateBtn) {
                validateBtn.disabled = true;
                validateBtn.style.opacity = "0.5";
            }
            return;
        }

        const affectations = await DataManager.get('affectations') || [];
        const affectation = affectations.find(a =>
            a.id_enseignant == id_enseignant &&
            a.code_filiere == code_filiere &&
            a.id_periode == currentPeriod.id_periode
        );

        if (affectation) {
            const subject = (await DataManager.get('subjects')).find(s => s.code_matiere == affectation.code_matiere);
            subjectLabel.innerText = subject ? subject.nom_matiere : "Matière inconnue";
            subjectLabel.style.color = "var(--success)";
            subjectCodeInput.value = affectation.code_matiere;
            periodIdInput.value = currentPeriod.id_periode;
            if (validateBtn) {
                validateBtn.disabled = false;
                validateBtn.style.opacity = "1";
            }
        } else {
            subjectLabel.innerText = "Aucune matière attribuée";
            subjectLabel.style.color = "var(--danger)";
            if (validateBtn) {
                validateBtn.disabled = true;
                validateBtn.style.opacity = "0.5";
            }
        }
    },

    async renderAttendance() {
        const filter = document.getElementById('filter-major')?.value;
        const list = document.getElementById('attendance-list');
        let students = await DataManager.get('students') || [];
        const majors = await DataManager.get('majors');
        if (filter) students = students.filter(s => s.code_filiere == filter);

        list.innerHTML = students.map(s => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 0.5rem;">${s.nom} ${s.prenom} <br> <small style="color: var(--text-muted);">${majors.find(m => m.code_filiere == s.code_filiere)?.libelle_filiere}</small></td>
                <td style="padding: 1rem 0.5rem;"><span id="status-${s.id_etudiant}" style="color: var(--success);">Présent</span></td>
                <td style="padding: 1rem 0.5rem; display: flex; gap: 5px;">
                    <button class="btn" onclick="App.toggleStatus(${s.id_etudiant})" style="padding: 0.3rem 0.6rem; font-size: 0.7rem;">Changer</button>
                    <button class="btn" onclick="App.removeStudent(${s.id_etudiant})" style="padding: 0.3rem 0.6rem; font-size: 0.7rem; background: var(--danger); color: white;">Supprimer</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="text-align:center; padding: 1rem;">Aucun étudiant.</td></tr>';
    },

    toggleStatus(id) {
        const b = document.getElementById(`status-${id}`);
        if (!b) return;
        b.innerText = b.innerText === 'Présent' ? 'Absent' : 'Présent';
        b.style.color = b.innerText === 'Présent' ? 'var(--success)' : 'var(--danger)';
        this.showToast(`Statut mis à jour pour l'étudiant.`, 'success');
    },

    async removeStudent(id) {
        await DataManager.remove('students', id);
        await this.renderAttendance();
        this.showToast('Étudiant supprimé.', 'success');
    },

    // --- Module: Édition ---
    async initEdition() {
        const majors = await DataManager.get('majors');
        const periods = await DataManager.get('periods');
        const container = document.getElementById('edition-view');
        container.innerHTML = `
            <div class="glass-card">
                <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Rapports</h2>
                <div class="grid-container">
                    <div class="glass-card">
                        <h3>Matières par Filière</h3>
                        <select id="report-major" class="form-input" style="margin: 1rem 0;">
                            ${majors.map(m => `<option value="${m.code_filiere}">${m.libelle_filiere} (${m.niveau || 'N/A'})</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="App.generateReport('subjects')">Générer</button>
                    </div>

                    <div class="glass-card">
                        <h3>Absences par Période</h3>
                        <select id="report-period" class="form-input" style="margin: 1rem 0;">
                            ${periods.map(p => `<option value="${p.id_periode}">Du ${new Date(p.date_debut).toLocaleDateString()} au ${new Date(p.date_fin).toLocaleDateString()}</option>`).join('') || '<option>Aucune période</option>'}
                        </select>
                        <button class="btn btn-primary" onclick="App.generateReport('absences')">Consulter</button>
                    </div>
                </div>
                <div id="report-result" class="glass-card hidden scrollable-list" style="margin-top: 1.5rem;">
                    <div id="report-content"></div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async generateReport(type) {
        const content = document.getElementById('report-content');
        const res = document.getElementById('report-result');

        if (type === 'subjects') {
            const mCode = document.getElementById('report-major').value;
            if (!mCode) return this.showToast('Veuillez sélectionner une filière.', 'error');

            res.classList.remove('hidden');
            const affectations = await DataManager.get('affectations') || [];
            const subjects = await DataManager.get('subjects');
            const teachers = await DataManager.get('teachers');
            const periods = await DataManager.get('periods');

            const majorAffectations = affectations.filter(a => a.code_filiere == mCode);

            if (majorAffectations.length === 0) {
                content.innerHTML = `<h4>Matières du Programme :</h4><p style="color: var(--text-muted); margin-top: 1rem;">Aucune affectation trouvée pour cette filière.</p>`;
                return;
            }

            let html = `<h4>Matières du Programme :</h4><div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">`;

            majorAffectations.forEach(aff => {
                const mat = subjects.find(s => s.code_matiere == aff.code_matiere);
                const prof = teachers.find(t => t.id_enseignant == aff.id_enseignant);
                const per = periods.find(p => p.id_periode == aff.id_periode);
                const perLabel = per ? `Période du ${new Date(per.date_debut).toLocaleDateString()} au ${new Date(per.date_fin).toLocaleDateString()}` : 'Période inconnue';

                if (mat && prof) {
                    html += `
                        <div style="padding: 1rem; background: var(--card-bg); border-left: 3px solid var(--primary); border-radius: 8px;">
                            <h5 style="font-size: 1rem; margin-bottom: 0.5rem;">${mat.nom_matiere}</h5>
                            <p style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                                <i data-lucide="user" style="width: 14px;"></i> Prof. ${prof.nom} ${prof.prenom}
                            </p>
                            <p style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px;">
                                <i data-lucide="calendar" style="width: 14px;"></i> ${perLabel}
                            </p>
                        </div>
                    `;
                }
            });
            html += `</div>`;
            content.innerHTML = html;
            lucide.createIcons();
        }
        else if (type === 'absences') {
            const periodId = document.getElementById('report-period').value;
            if (!periodId) return this.showToast('Veuillez sélectionner une période.', 'error');

            res.classList.remove('hidden');
            content.innerHTML = '<p style="text-align:center; padding: 1rem;">Analyse des données en cours...</p>';

            try {
                const data = await DataManager.get(`reports/absences/${periodId}`);

                if (!data || data.length === 0) {
                    content.innerHTML = '<p style="text-align:center; padding: 1rem; color: var(--text-muted);">Aucune donnée d\'absence pour cette période.</p>';
                    return;
                }

                let html = `
                    <div style="margin-bottom: 1rem; padding: 10px; background: rgba(var(--primary-rgb), 0.1); border-radius: 8px;">
                        <h4 style="font-size: 0.9rem; color: var(--primary);">Bilan des Absences par Étudiant</h4>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                <th style="padding: 10px; font-size: 0.75rem; color: var(--text-muted);">ÉTUDIANT</th>
                                <th style="padding: 10px; font-size: 0.75rem; color: var(--text-muted);">FILIÈRE</th>
                                <th style="padding: 10px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">TOTAL ABSENCES</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                data.forEach(row => {
                    const color = row.total_absences > 5 ? 'var(--danger)' : row.total_absences > 2 ? 'var(--warning)' : 'var(--success)';
                    html += `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 12px 10px;">
                                <div style="font-weight: 600; font-size: 0.9rem;">${row.nom} ${row.prenom}</div>
                            </td>
                            <td style="padding: 12px 10px; font-size: 0.8rem; color: var(--text-muted);">${row.libelle_filiere}</td>
                            <td style="padding: 12px 10px; text-align: center;">
                                <span style="background: ${color}20; color: ${color}; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
                                    ${row.total_absences}
                                </span>
                            </td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                content.innerHTML = html;
            } catch (error) {
                console.error(error);
                content.innerHTML = '<p style="text-align:center; padding: 1rem; color: var(--danger);">Erreur lors de la génération du rapport.</p>';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());