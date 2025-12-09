// Toast Club PMV - Impulsador Panel

// Mock user ID (in a real app, this would come from authentication)
const CURRENT_USER_ID = 'usr_demo_impulsador';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();
    setupFormHandler();
});

// Setup form submission
function setupFormHandler() {
    const form = document.getElementById('sessionForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createSession();
    });
}

// Create new session
async function createSession() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const sessionData = {
        user_id: CURRENT_USER_ID,
        title: title,
        description: description || null
    };

    try {
        const session = await SessionAPI.create(sessionData);
        
        // Show success message
        showMessage('Sesión creada exitosamente', 'success');
        
        // Clear form
        document.getElementById('sessionForm').reset();
        
        // Reload sessions list
        await loadSessions();
    } catch (error) {
        showMessage(`Error al crear sesión: ${error.message}`, 'error');
    }
}

// Load sessions for current user
async function loadSessions() {
    const sessionsList = document.getElementById('sessionsList');
    
    try {
        const sessions = await SessionAPI.list(CURRENT_USER_ID);
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p class="loading">No hay sesiones creadas aún.</p>';
            return;
        }
        
        // Sort by created_at descending
        sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        sessionsList.innerHTML = sessions.map(session => createSessionCard(session)).join('');
        
        // Add event listeners to action buttons
        addSessionActionListeners();
    } catch (error) {
        sessionsList.innerHTML = `<p class="error">Error al cargar sesiones: ${error.message}</p>`;
    }
}

// Create session card HTML
function createSessionCard(session) {
    const date = new Date(session.created_at).toLocaleString('es-ES');
    const stateLabel = getStateLabel(session.state);
    
    return `
        <div class="session-card" data-session-id="${session.id}">
            <h3>${session.title}</h3>
            <p class="session-info">${session.description || 'Sin descripción'}</p>
            <p class="session-info">Creada: ${date}</p>
            <span class="session-state state-${session.state}">${stateLabel}</span>
            <div style="margin-top: 15px;">
                ${getStateActions(session)}
            </div>
        </div>
    `;
}

// Get state label in Spanish
function getStateLabel(state) {
    const labels = {
        'created': 'Creada',
        'ready_to_start': 'Lista para iniciar',
        'running': 'En ejecución',
        'audio_uploaded': 'Audio subido',
        'survey_pending': 'Encuesta pendiente',
        'completed': 'Completada'
    };
    return labels[state] || state;
}

// Get available actions based on state
function getStateActions(session) {
    const actions = [];
    
    switch (session.state) {
        case 'created':
            actions.push(`<button class="btn-secondary" onclick="updateState('${session.id}', 'ready_to_start')">Marcar como lista</button>`);
            break;
        case 'ready_to_start':
            actions.push(`<button class="btn-secondary" onclick="updateState('${session.id}', 'running')">Iniciar sesión</button>`);
            break;
        case 'running':
            actions.push(`<button class="btn-secondary" onclick="updateState('${session.id}', 'audio_uploaded')">Marcar audio subido</button>`);
            break;
        case 'audio_uploaded':
            actions.push(`<button class="btn-secondary" onclick="updateState('${session.id}', 'survey_pending')">Solicitar encuesta</button>`);
            break;
        case 'survey_pending':
            actions.push(`<button class="btn-secondary" onclick="updateState('${session.id}', 'completed')">Completar sesión</button>`);
            break;
    }
    
    if (session.state !== 'completed') {
        actions.push(`<button class="btn-secondary" onclick="deleteSession('${session.id}')">Eliminar</button>`);
    }
    
    return actions.join(' ');
}

// Update session state
async function updateState(sessionId, newState) {
    try {
        await SessionAPI.updateState(sessionId, newState);
        showMessage('Estado actualizado', 'success');
        await loadSessions();
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Delete session
async function deleteSession(sessionId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
        return;
    }
    
    try {
        await SessionAPI.delete(sessionId);
        showMessage('Sesión eliminada', 'success');
        await loadSessions();
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Add event listeners
function addSessionActionListeners() {
    // Event delegation is handled through onclick attributes in HTML
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
