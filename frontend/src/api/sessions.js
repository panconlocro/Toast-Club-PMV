import apiClient from './client'

const API_V1 = '/api/v1'

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post(`${API_V1}/auth/login`, { email, password })
    return response.data
  },
  
  logout: async () => {
    const response = await apiClient.post(`${API_V1}/auth/logout`)
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get(`${API_V1}/auth/me`)
    return response.data
  }
}

export const sessionsAPI = {
  createSession: async (sessionData) => {
    const response = await apiClient.post(`${API_V1}/sessions`, sessionData)
    return response.data
  },
  
  getSession: async (sessionId) => {
    const response = await apiClient.get(`${API_V1}/sessions/${sessionId}`)
    return response.data
  },
  
  updateSessionState: async (sessionId, newState) => {
    const response = await apiClient.patch(`${API_V1}/sessions/${sessionId}/state`, {
      new_state: newState
    })
    return response.data
  },
  
  submitSurvey: async (sessionId, surveyData) => {
    const response = await apiClient.post(`${API_V1}/sessions/${sessionId}/survey`, {
      respuestas_json: surveyData
    })
    return response.data
  },

  getSurveys: async (sessionId) => {
    const response = await apiClient.get(`${API_V1}/sessions/${sessionId}/survey`)
    return response.data
  }
}

export const datasetAPI = {
  getDataset: async () => {
    const response = await apiClient.get(`${API_V1}/dataset`)
    return response.data
  },
  
  exportDataset: async () => {
    const response = await apiClient.get(`${API_V1}/dataset/export`, {
      responseType: 'blob'
    })
    return response.data
  }
}
