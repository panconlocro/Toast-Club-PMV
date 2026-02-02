import { useState } from 'react'
import { sessionsAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'
import Card from './ui/Card'
import Select from './ui/Select'
import Input from './ui/Input'
import Button from './ui/Button'
import InlineMessage from './ui/InlineMessage'
import { mapApiError } from '../api/errors'

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
    if (loading) {
      return
    }
    setError('')
    setLoading(true)

    try {
      await sessionsAPI.submitSurvey(sessionId, formData)
      onSurveySubmitted()
    } catch (err) {
      setError(mapApiError(err, UI_COPY.surveyForm.submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={UI_COPY.surveyForm.title} subtitle={UI_COPY.surveyForm.subtitle}>
      
      <form onSubmit={handleSubmit} className="ui-form">
        <Select
          id="experiencia_general"
          name="experiencia_general"
          label={UI_COPY.surveyForm.overallExperience}
          value={formData.experiencia_general}
          onChange={handleChange}
          required
        >
          <option value="">{UI_COPY.surveyForm.selectOption}</option>
          <option value="excelente">{UI_COPY.surveyForm.excellent}</option>
          <option value="buena">{UI_COPY.surveyForm.good}</option>
          <option value="regular">{UI_COPY.surveyForm.regular}</option>
          <option value="mala">{UI_COPY.surveyForm.bad}</option>
        </Select>

        <Select
          id="facilidad_uso"
          name="facilidad_uso"
          label={UI_COPY.surveyForm.easeOfUse}
          value={formData.facilidad_uso}
          onChange={handleChange}
          required
        >
          <option value="">{UI_COPY.surveyForm.selectOption}</option>
          <option value="muy_facil">{UI_COPY.surveyForm.veryEasy}</option>
          <option value="facil">{UI_COPY.surveyForm.easy}</option>
          <option value="dificil">{UI_COPY.surveyForm.difficult}</option>
          <option value="muy_dificil">{UI_COPY.surveyForm.veryDifficult}</option>
        </Select>

        <Select
          id="utilidad_entrenamiento"
          name="utilidad_entrenamiento"
          label={UI_COPY.surveyForm.trainingUsefulness}
          value={formData.utilidad_entrenamiento}
          onChange={handleChange}
          required
        >
          <option value="">{UI_COPY.surveyForm.selectOption}</option>
          <option value="muy_util">{UI_COPY.surveyForm.veryUseful}</option>
          <option value="util">{UI_COPY.surveyForm.useful}</option>
          <option value="poco_util">{UI_COPY.surveyForm.somewhatUseful}</option>
          <option value="no_util">{UI_COPY.surveyForm.notUseful}</option>
        </Select>

        <Select
          id="volveria_usar"
          name="volveria_usar"
          label={UI_COPY.surveyForm.wouldUseAgain}
          value={formData.volveria_usar}
          onChange={handleChange}
          required
        >
          <option value="">{UI_COPY.surveyForm.selectOption}</option>
          <option value="si">{UI_COPY.surveyForm.yes}</option>
          <option value="no">{UI_COPY.surveyForm.no}</option>
          <option value="tal_vez">{UI_COPY.surveyForm.maybe}</option>
        </Select>

        <Input
          as="textarea"
          id="mejoras_sugeridas"
          name="mejoras_sugeridas"
          label={UI_COPY.surveyForm.improvements}
          value={formData.mejoras_sugeridas}
          onChange={handleChange}
          placeholder={UI_COPY.surveyForm.improvementsPlaceholder}
          rows="4"
        />

        {error && <InlineMessage variant="error">{error}</InlineMessage>}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? UI_COPY.surveyForm.submitting : UI_COPY.surveyForm.submit}
        </Button>
      </form>
    </Card>
  )
}

export default SurveyForm
