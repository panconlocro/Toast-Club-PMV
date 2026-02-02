import apiClient from './client'
import './types'

const API_V1 = '/api/v1'

export const authAPI = {
  /** @returns {Promise<Object>} */
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

export const textsAPI = {
  /** @returns {Promise<{texts: Array<Object>}>} */
  getTexts: async (filters = {}) => {
    const response = await apiClient.get(`${API_V1}/texts`, { params: filters })
    return response.data
  },

  getTags: async () => {
    const response = await apiClient.get(`${API_V1}/texts/tags`)
    return response.data
  },
  
  getTextById: async (textId) => {
    const response = await apiClient.get(`${API_V1}/texts/${textId}`)
    return response.data
  }
}

export const sessionsAPI = {
  /** @returns {Promise<import('./types').Session>} */
  createSession: async (sessionData) => {
    const response = await apiClient.post(`${API_V1}/sessions`, sessionData)
    return response.data
  },
  
  /** @returns {Promise<import('./types').Session>} */
  getSession: async (sessionId) => {
    const response = await apiClient.get(`${API_V1}/sessions/${sessionId}`)
    return response.data
  },
  
  /** @returns {Promise<import('./types').Session>} */
  updateSessionState: async (sessionId, newState) => {
    const response = await apiClient.patch(`${API_V1}/sessions/${sessionId}/state`, {
      new_state: newState
    })
    return response.data
  },
  
  /** @returns {Promise<Object>} */
  submitSurvey: async (sessionId, surveyData) => {
    const response = await apiClient.post(`${API_V1}/sessions/${sessionId}/survey`, {
      respuestas_json: surveyData
    })
    return response.data
  },

  /** @returns {Promise<{surveys: import('./types').Survey[]}>} */
  getSurveys: async (sessionId) => {
    const response = await apiClient.get(`${API_V1}/sessions/${sessionId}/survey`)
    return response.data
  }
}

export const datasetAPI = {
  /** @returns {Promise<{dataset: import('./types').Session[], total_sessions: number}>} */
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

export const recordingsAPI = {
  /** @returns {Promise<{download_url: string}>} */
  getRecordingDownloadUrl: async (recordingId) => {
    const response = await apiClient.get(`${API_V1}/recordings/${recordingId}/download`)
    return response.data
  }
}
