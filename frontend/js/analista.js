// Toast Club PMV - Analista Panel

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadSessions();
    setupFilters();
});

// Setup filter controls
function setupFilters() {
    const stateFilter = document.getElementById('stateFilter');
    stateFilter.addEventListener('change', () => {
        loadSessions();
    });
}

// Load statistics
async function loadStats() {
    try {
        const [sessions, users, surveys] = await Promise.all([
            SessionAPI.list(),
            UserAPI.list(),
            SurveyAPI.list()
        ]);
        
        // Calculate stats
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.state === 'completed').length;
        const totalUsers = users.length;
        const totalSurveys = surveys.filter(s => s.is_completed).length;
        
        // Update UI
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('completedSessions').textContent = completedSessions;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalSurveys').textContent = totalSurveys;
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Error al cargar estadísticas');
    }
}

// Load sessions for analysis
async function loadSessions() {
    const sessionsTable = document.getElementById('sessionsTable');
    const stateFilter = document.getElementById('stateFilter').value;
    
    try {
        let sessions = await SessionAPI.list();
        
        // Apply filter
        if (stateFilter) {
            sessions = sessions.filter(s => s.state === stateFilter);
        }
        
        if (sessions.length === 0) {
            sessionsTable.innerHTML = '<p class="loading">No hay sesiones para mostrar.</p>';
            return;
        }
        
        // Sort by created_at descending
        sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Create table
        sessionsTable.innerHTML = createSessionsTable(sessions);
    } catch (error) {
        sessionsTable.innerHTML = `<p class="error">Error al cargar sesiones: ${error.message}</p>`;
    }
}

// Create sessions table HTML
function createSessionsTable(sessions) {
    const rows = sessions.map(session => {
        const created = new Date(session.created_at).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const started = session.started_at 
            ? new Date(session.started_at).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';
        
        const completed = session.completed_at
            ? new Date(session.completed_at).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';
        
        const duration = calculateDuration(session);
        const stateLabel = getStateLabel(session.state);
        
        return `
            <tr>
                <td>${session.title}</td>
                <td><span class="session-state state-${session.state}">${stateLabel}</span></td>
                <td>${created}</td>
                <td>${started}</td>
                <td>${completed}</td>
                <td>${duration}</td>
                <td>${session.recording_id ? '✓' : '-'}</td>
                <td>${session.survey_id ? '✓' : '-'}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Creada</th>
                    <th>Iniciada</th>
                    <th>Completada</th>
                    <th>Duración</th>
                    <th>Audio</th>
                    <th>Encuesta</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Calculate session duration
function calculateDuration(session) {
    if (!session.started_at || !session.completed_at) {
        return '-';
    }
    
    const start = new Date(session.started_at);
    const end = new Date(session.completed_at);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
        return `${diffMins} min`;
    }
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
}

// Get state label in Spanish
function getStateLabel(state) {
    const labels = {
        'created': 'Creada',
        'ready_to_start': 'Lista',
        'running': 'Ejecutando',
        'audio_uploaded': 'Audio OK',
        'survey_pending': 'Encuesta pend.',
        'completed': 'Completada'
    };
    return labels[state] || state;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
