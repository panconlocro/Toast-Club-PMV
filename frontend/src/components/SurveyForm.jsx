import { useState } from 'react'
import { sessionsAPI } from '../api/sessions'

function SurveyForm({ sessionId, onSurveySubmitted }) {
  const [formData, setFormData] = useState({
    experiencia_general: '',
    facilidad_uso: '',
    utilidad_entrenamiento: '',
    mejoras_sugeridas: '',
    volveria_usar: ''
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
      await sessionsAPI.submitSurvey(sessionId, formData)
      onSurveySubmitted()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit survey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Training Feedback Survey</h2>
      <p>Please share your experience with this training session.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="experiencia_general">Overall Experience *</label>
          <select
            id="experiencia_general"
            name="experiencia_general"
            value={formData.experiencia_general}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="excelente">Excellent</option>
            <option value="buena">Good</option>
            <option value="regular">Regular</option>
            <option value="mala">Bad</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="facilidad_uso">Ease of Use *</label>
          <select
            id="facilidad_uso"
            name="facilidad_uso"
            value={formData.facilidad_uso}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="muy_facil">Very Easy</option>
            <option value="facil">Easy</option>
            <option value="dificil">Difficult</option>
            <option value="muy_dificil">Very Difficult</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="utilidad_entrenamiento">Training Usefulness *</label>
          <select
            id="utilidad_entrenamiento"
            name="utilidad_entrenamiento"
            value={formData.utilidad_entrenamiento}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="muy_util">Very Useful</option>
            <option value="util">Useful</option>
            <option value="poco_util">Somewhat Useful</option>
            <option value="no_util">Not Useful</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="volveria_usar">Would you use it again? *</label>
          <select
            id="volveria_usar"
            name="volveria_usar"
            value={formData.volveria_usar}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="si">Yes</option>
            <option value="no">No</option>
            <option value="tal_vez">Maybe</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mejoras_sugeridas">Suggested Improvements</label>
          <textarea
            id="mejoras_sugeridas"
            name="mejoras_sugeridas"
            value={formData.mejoras_sugeridas}
            onChange={handleChange}
            placeholder="Tell us how we can improve..."
            rows="4"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Survey'}
        </button>
      </form>
    </div>
  )
}

export default SurveyForm
