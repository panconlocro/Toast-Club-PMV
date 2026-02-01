import { useState } from 'react'
import { sessionsAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'

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
      setError(err.response?.data?.detail || UI_COPY.surveyForm.submitError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>{UI_COPY.surveyForm.title}</h2>
      <p>{UI_COPY.surveyForm.subtitle}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="experiencia_general">{UI_COPY.surveyForm.overallExperience}</label>
          <select
            id="experiencia_general"
            name="experiencia_general"
            value={formData.experiencia_general}
            onChange={handleChange}
            required
          >
            <option value="">{UI_COPY.surveyForm.selectOption}</option>
            <option value="excelente">{UI_COPY.surveyForm.excellent}</option>
            <option value="buena">{UI_COPY.surveyForm.good}</option>
            <option value="regular">{UI_COPY.surveyForm.regular}</option>
            <option value="mala">{UI_COPY.surveyForm.bad}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="facilidad_uso">{UI_COPY.surveyForm.easeOfUse}</label>
          <select
            id="facilidad_uso"
            name="facilidad_uso"
            value={formData.facilidad_uso}
            onChange={handleChange}
            required
          >
            <option value="">{UI_COPY.surveyForm.selectOption}</option>
            <option value="muy_facil">{UI_COPY.surveyForm.veryEasy}</option>
            <option value="facil">{UI_COPY.surveyForm.easy}</option>
            <option value="dificil">{UI_COPY.surveyForm.difficult}</option>
            <option value="muy_dificil">{UI_COPY.surveyForm.veryDifficult}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="utilidad_entrenamiento">{UI_COPY.surveyForm.trainingUsefulness}</label>
          <select
            id="utilidad_entrenamiento"
            name="utilidad_entrenamiento"
            value={formData.utilidad_entrenamiento}
            onChange={handleChange}
            required
          >
            <option value="">{UI_COPY.surveyForm.selectOption}</option>
            <option value="muy_util">{UI_COPY.surveyForm.veryUseful}</option>
            <option value="util">{UI_COPY.surveyForm.useful}</option>
            <option value="poco_util">{UI_COPY.surveyForm.somewhatUseful}</option>
            <option value="no_util">{UI_COPY.surveyForm.notUseful}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="volveria_usar">{UI_COPY.surveyForm.wouldUseAgain}</label>
          <select
            id="volveria_usar"
            name="volveria_usar"
            value={formData.volveria_usar}
            onChange={handleChange}
            required
          >
            <option value="">{UI_COPY.surveyForm.selectOption}</option>
            <option value="si">{UI_COPY.surveyForm.yes}</option>
            <option value="no">{UI_COPY.surveyForm.no}</option>
            <option value="tal_vez">{UI_COPY.surveyForm.maybe}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mejoras_sugeridas">{UI_COPY.surveyForm.improvements}</label>
          <textarea
            id="mejoras_sugeridas"
            name="mejoras_sugeridas"
            value={formData.mejoras_sugeridas}
            onChange={handleChange}
            placeholder={UI_COPY.surveyForm.improvementsPlaceholder}
            rows="4"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? UI_COPY.surveyForm.submitting : UI_COPY.surveyForm.submit}
        </button>
      </form>
    </div>
  )
}

export default SurveyForm
