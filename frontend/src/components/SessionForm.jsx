import React, { useState } from 'react'
import { sessionsAPI } from '../api/sessions'

function SessionForm({ onSessionCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    edad_aproximada: '',
    email_opcional: '',
    texto_seleccionado: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const sessionData = {
        datos_participante: {
          nombre: formData.nombre,
          edad_aproximada: formData.edad_aproximada ? parseInt(formData.edad_aproximada) : null,
          email_opcional: formData.email_opcional || null
        },
        texto_seleccionado: formData.texto_seleccionado
      }

      const response = await sessionsAPI.createSession(sessionData)
      onSessionCreated(response)
      
      // Reset form
      setFormData({
        nombre: '',
        edad_aproximada: '',
        email_opcional: '',
        texto_seleccionado: ''
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Create New Training Session</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Name / Alias *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Enter your name or alias"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edad_aproximada">Approximate Age</label>
          <input
            id="edad_aproximada"
            name="edad_aproximada"
            type="number"
            value={formData.edad_aproximada}
            onChange={handleChange}
            min="1"
            max="120"
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email_opcional">Email (Optional)</label>
          <input
            id="email_opcional"
            name="email_opcional"
            type="email"
            value={formData.email_opcional}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="texto_seleccionado">Training Text *</label>
          <textarea
            id="texto_seleccionado"
            name="texto_seleccionado"
            value={formData.texto_seleccionado}
            onChange={handleChange}
            required
            placeholder="Enter the text you will practice speaking..."
            rows="5"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  )
}

export default SessionForm
