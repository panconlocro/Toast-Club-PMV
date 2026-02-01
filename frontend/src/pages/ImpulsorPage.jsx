import { useEffect, useRef, useState } from 'react'
import SessionForm from '../components/SessionForm'
import SurveyForm from '../components/SurveyForm'
import { sessionsAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'

function ImpulsorPage() {
  const [currentSession, setCurrentSession] = useState(null)
  const [message, setMessage] = useState('')
  const [lastCheck, setLastCheck] = useState(null)
  const pollingIntervalRef = useRef(null)

  const handleCreateNewSession = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setCurrentSession(null)
    setLastCheck(null)
    setMessage('')
  }

  const handleSessionCreated = (session) => {
    setCurrentSession(session)
    setMessage(UI_COPY.impulsor.successCreated)
  }

  const handleCopySessionCode = async () => {
    const code = currentSession?.session_code
    if (!code) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = code
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setMessage(UI_COPY.impulsor.codeCopied)
    } catch {
      setMessage(UI_COPY.impulsor.codeCopyError)
    }
  }

  const handleStartSession = async () => {
    try {
      await sessionsAPI.updateSessionState(currentSession.id, 'ready_to_start')
      const updatedSession = await sessionsAPI.updateSessionState(currentSession.id, 'running')
      setCurrentSession(updatedSession)
    } catch (error) {
      setMessage(`${UI_COPY.impulsor.startError}: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleContinueToSurvey = async () => {
    try {
      const updatedSession = await sessionsAPI.updateSessionState(currentSession.id, 'survey_pending')
      setCurrentSession(updatedSession)
    } catch (error) {
      setMessage(`${UI_COPY.impulsor.continueError}: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleSurveySubmitted = () => {
    setCurrentSession((prev) => {
      if (!prev) return prev
      return { ...prev, estado: 'completed' }
    })
    setMessage('')
  }

  // Poll backend while the session is running so the UI updates automatically.
  useEffect(() => {
    const sessionId = currentSession?.id
    const isRunning = currentSession?.estado === 'running'

    // Stop polling when we don't have a session or it stopped running.
    if (!sessionId || !isRunning) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    // Avoid duplicate intervals.
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const latest = await sessionsAPI.getSession(sessionId)
          setCurrentSession(() => latest)
          setLastCheck(new Date())
        } catch (error) {
          console.warn('Polling failed:', error?.message || error)
        }
      }, 2500)
    }

    // Cleanup on unmount.
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [currentSession?.id, currentSession?.estado])

  return (
    <div className="container">
      <h1>{UI_COPY.impulsor.title}</h1>
      <p>{UI_COPY.impulsor.subtitle}</p>

      {message && (
        <div className="card">
          <div className="success">{message}</div>
        </div>
      )}

      {!currentSession && (
        <SessionForm onSessionCreated={handleSessionCreated} />
      )}

      {currentSession && currentSession.estado !== 'survey_pending' && currentSession.estado !== 'completed' && (
        <div className="card">
          <h2>{UI_COPY.impulsor.currentSessionTitle}</h2>
          <p>
            <strong>{UI_COPY.impulsor.sessionCode}:</strong> {currentSession.session_code}{' '}
            {currentSession.estado !== 'running' && (
              <button
                type="button"
                onClick={handleCopySessionCode}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '14px', marginLeft: '8px' }}
              >
                {UI_COPY.impulsor.copy}
              </button>
            )}
          </p>
          <p><strong>{UI_COPY.impulsor.participant}:</strong> {currentSession.datos_participante.nombre}</p>
          <p><strong>{UI_COPY.impulsor.state}:</strong> {UI_COPY.stateLabels[currentSession.estado] || currentSession.estado}</p>
          <p><strong>{UI_COPY.impulsor.trainingText}:</strong></p>
          <p style={{backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px'}}>
            {currentSession.texto_seleccionado?.Title || UI_COPY.impulsor.noTextSelected}
          </p>

          <div style={{marginTop: '20px'}}>
            {currentSession.estado === 'created' && (
              <button onClick={handleStartSession} className="btn btn-primary">
                {UI_COPY.impulsor.startButton}
              </button>
            )}
            
            {currentSession.estado === 'running' && (
              <>
                <p><strong>{UI_COPY.impulsor.waitingAudioTitle}</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                  <div className="loader" aria-label={UI_COPY.common.loading} />
                  <p style={{ margin: 0 }}>
                    {UI_COPY.impulsor.waitingAudioBody}
                  </p>
                </div>
                {lastCheck && (
                  <p style={{ marginTop: '8px' }}>
                    <strong>{UI_COPY.impulsor.lastCheck}:</strong> {lastCheck.toLocaleTimeString()}
                  </p>
                )}
              </>
            )}
            
            {currentSession.estado === 'audio_uploaded' && (
              <>
                <p><strong>{UI_COPY.impulsor.audioReceived}</strong></p>
                <button onClick={handleContinueToSurvey} className="btn btn-primary">
                  {UI_COPY.impulsor.continueToSurvey}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {currentSession?.estado === 'survey_pending' && (
        <SurveyForm 
          sessionId={currentSession.id}
          onSurveySubmitted={handleSurveySubmitted}
        />
      )}

      {currentSession?.estado === 'completed' && (
        <div className="card">
          <h2>{UI_COPY.impulsor.completedTitle}</h2>
          <p><strong>{UI_COPY.impulsor.sessionCode}:</strong> {currentSession.session_code}</p>
          <p><strong>{UI_COPY.impulsor.participant}:</strong> {currentSession.datos_participante?.nombre}</p>
          <div style={{ marginTop: '16px' }}>
            <button onClick={handleCreateNewSession} className="btn btn-primary">
              {UI_COPY.impulsor.newSession}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImpulsorPage
