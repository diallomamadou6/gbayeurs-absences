// ============================================
// HELPERS.JS - Fonctions utilitaires
// ============================================

const Helpers = {
    // Formater une date
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Afficher un message de feedback
    showFeedback(message, type = 'success') {
        const existingFeedback = document.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        feedback.innerHTML = `
            <div class="feedback-icon">${icons[type] || icons.info}</div>
            <div class="feedback-content">
                <div class="feedback-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    },

    // Sauvegarder dans localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erreur de sauvegarde:', e);
            return false;
        }
    },

    // Charger depuis localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Erreur de chargement:', e);
            return null;
        }
    },

    // Valider un formulaire
    validateForm(formData) {
        const errors = [];
        
        for (let [key, value] of Object.entries(formData)) {
            if (!value || value === '') {
                errors.push(`Le champ ${key} est requis`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Debounce pour optimiser les appels
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Générer un ID unique
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Capitaliser la première lettre
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Échapper les caractères HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Tronquer un texte
    truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

console.log('✅ Helpers chargés');
