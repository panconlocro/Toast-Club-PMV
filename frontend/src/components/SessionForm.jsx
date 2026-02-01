import { useState, useEffect } from 'react'
import { sessionsAPI, textsAPI } from '../api/sessions'

function SessionForm({ onSessionCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    edad_aproximada: '',
    email_opcional: '',
    texto_seleccionado_id: ''
  })
  const [availableTexts, setAvailableTexts] = useState([])
  const [availableTags, setAvailableTags] = useState({ keys: [], values: {} })
  const [tagFilters, setTagFilters] = useState({
    tema: '',
    tono: '',
    audiencia: '',
    duracion_aprox: '',
    contexto: '',
    intencion: '',
    referentes: '',
    subtema: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [textsLoading, setTextsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normalizeText = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Fetch available texts on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [textsResponse, tagsResponse] = await Promise.all([
          textsAPI.getTexts(),
          textsAPI.getTags()
        ])
        setAvailableTexts(textsResponse.texts || [])
        setAvailableTags(tagsResponse || { keys: [], values: {} })
      } catch (err) {
        console.error('Failed to fetch texts:', err)
        setError('Failed to load available texts')
      } finally {
        setTextsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Fetch texts when tag filters change
  useEffect(() => {
    const fetchFilteredTexts = async () => {
      setTextsLoading(true)
      setError('')

      const filters = Object.fromEntries(
        Object.entries(tagFilters).filter(([, value]) => value)
      )

      try {
        const response = await textsAPI.getTexts(filters)
        setAvailableTexts(response.texts || [])
      } catch (err) {
        console.error('Failed to fetch texts:', err)
        setError('Failed to load available texts')
      } finally {
        setTextsLoading(false)
      }
    }

    fetchFilteredTexts()
  }, [tagFilters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagFilterChange = (e) => {
    const { name, value } = e.target
    setTagFilters(prev => ({
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
        texto_seleccionado_id: formData.texto_seleccionado_id
      }

      const response = await sessionsAPI.createSession(sessionData)
      onSessionCreated(response)
      
      // Reset form
      setFormData({
        nombre: '',
        edad_aproximada: '',
        email_opcional: '',
        texto_seleccionado_id: ''
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  const tagConfigs = [
    { key: 'tema', label: 'Tema' },
    { key: 'tono', label: 'Tono' },
    { key: 'audiencia', label: 'Audiencia' },
    { key: 'duracion_aprox', label: 'Duración aprox.' },
    { key: 'contexto', label: 'Contexto' },
    { key: 'intencion', label: 'Intención' },
    { key: 'referentes', label: 'Referentes' },
    { key: 'subtema', label: 'Subtema' }
  ]

  // Filter by search query on the frontend
  const normalizedQuery = normalizeText(searchQuery.trim())
  const filteredTexts = availableTexts.filter(text =>
    normalizeText(text.Title).includes(normalizedQuery)
  )

  // Keep selection in sync with filtered results
  useEffect(() => {
    if (!formData.texto_seleccionado_id) {
      return
    }
    const exists = filteredTexts.some(t => t.Id === formData.texto_seleccionado_id)
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        texto_seleccionado_id: ''
      }))
    }
  }, [filteredTexts, formData.texto_seleccionado_id])

  // Get the selected text's tags for preview
  const selectedText = filteredTexts.find(t => t.Id === formData.texto_seleccionado_id)

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

        {(availableTags.keys || []).length > 0 && (
          <div className="form-group">
            <label>Filtros por tags</label>
            <div
              style={{
                display: 'grid',
                gap: '0.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                alignItems: 'start'
              }}
            >
              {tagConfigs
                .filter(({ key }) => availableTags.keys.includes(key))
                .map(({ key, label }) => (
                  <div key={key} style={{ display: 'grid', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
                    <select
                      name={key}
                      value={tagFilters[key]}
                      onChange={handleTagFilterChange}
                    >
                      <option value="">Cualquiera</option>
                      {(availableTags.values?.[key] || []).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="text_search">Search by title</label>
          <input
            id="text_search"
            name="text_search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="texto_seleccionado_id">Training Text *</label>
          {textsLoading ? (
            <p>Loading available texts...</p>
          ) : (
            filteredTexts.length > 0 ? (
              <select
                id="texto_seleccionado_id"
                name="texto_seleccionado_id"
                value={formData.texto_seleccionado_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a text --</option>
                {filteredTexts.map((text) => (
                  <option key={text.Id} value={text.Id}>
                    {text.Title}
                  </option>
                ))}
              </select>
            ) : (
              <p>No texts match your filters</p>
            )
          )}
        </div>

        {/* Show text metadata when selected */}
        {selectedText && selectedText.Tags && (
          <div className="text-preview" style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            <strong>Text Info:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {selectedText.Tags.duracion_aprox && (
                <li>Duration: {selectedText.Tags.duracion_aprox}</li>
              )}
              {selectedText.Tags.tema && (
                <li>Topic: {selectedText.Tags.tema}</li>
              )}
              {selectedText.Tags.tono && (
                <li>Tone: {selectedText.Tags.tono}</li>
              )}
              {selectedText.Tags.audiencia && (
                <li>Audience: {selectedText.Tags.audiencia}</li>
              )}
            </ul>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || textsLoading}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  )
}

export default SessionForm
