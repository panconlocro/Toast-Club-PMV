// Toast Club PMV - API Client

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }
        
        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Session API
const SessionAPI = {
    create: (data) => apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    list: (userId = null) => {
        const params = userId ? `?user_id=${userId}` : '';
        return apiRequest(`/sessions${params}`);
    },
    
    get: (sessionId) => apiRequest(`/sessions/${sessionId}`),
    
    update: (sessionId, data) => apiRequest(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    updateState: (sessionId, state) => apiRequest(`/sessions/${sessionId}/state?new_state=${state}`, {
        method: 'PATCH'
    }),
    
    delete: (sessionId) => apiRequest(`/sessions/${sessionId}`, {
        method: 'DELETE'
    })
};

// User API
const UserAPI = {
    create: (data) => apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    list: (role = null) => {
        const params = role ? `?role=${role}` : '';
        return apiRequest(`/users${params}`);
    },
    
    get: (userId) => apiRequest(`/users/${userId}`),
    
    update: (userId, data) => apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    delete: (userId) => apiRequest(`/users/${userId}`, {
        method: 'DELETE'
    })
};

// Recording API
const RecordingAPI = {
    create: (data) => apiRequest('/recordings', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    upload: async (sessionId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const url = `${API_BASE_URL}/recordings/upload?session_id=${sessionId}`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        return await response.json();
    },
    
    list: (sessionId = null) => {
        const params = sessionId ? `?session_id=${sessionId}` : '';
        return apiRequest(`/recordings${params}`);
    },
    
    get: (recordingId) => apiRequest(`/recordings/${recordingId}`),
    
    delete: (recordingId) => apiRequest(`/recordings/${recordingId}`, {
        method: 'DELETE'
    })
};

// Survey API
const SurveyAPI = {
    create: (data) => apiRequest('/surveys', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    list: (sessionId = null, userId = null) => {
        const params = new URLSearchParams();
        if (sessionId) params.append('session_id', sessionId);
        if (userId) params.append('user_id', userId);
        const queryString = params.toString();
        return apiRequest(`/surveys${queryString ? '?' + queryString : ''}`);
    },
    
    get: (surveyId) => apiRequest(`/surveys/${surveyId}`),
    
    update: (surveyId, data) => apiRequest(`/surveys/${surveyId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    delete: (surveyId) => apiRequest(`/surveys/${surveyId}`, {
        method: 'DELETE'
    })
};
