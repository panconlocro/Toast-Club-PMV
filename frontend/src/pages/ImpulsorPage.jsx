import React, { useEffect, useRef, useState } from 'react'
import SessionForm from '../components/SessionForm'
import SurveyForm from '../components/SurveyForm'
import { sessionsAPI } from '../api/sessions'

function ImpulsorPage() {
  const [currentSession, setCurrentSession] = useState(null)
  const [message, setMessage] = useState('')
  const [lastCheck, setLastCheck] = useState(null)
  const pollingIntervalRef = useRef(null)

  const handleSessionCreated = (session) => {
    setCurrentSession(session)
    setMessage(`Session created successfully! Session Code: ${session.session_code}`)
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
      setMessage('Session code copied to clipboard.')
    } catch (error) {
      setMessage('Could not copy session code.')
    }
  }

  const handleStartSession = async () => {
    try {
      await sessionsAPI.updateSessionState(currentSession.id, 'ready_to_start')
      const updatedSession = await sessionsAPI.updateSessionState(currentSession.id, 'running')
      setCurrentSession(updatedSession)  // <-- actualizar estado en React y que se actualice la UI
      setMessage('Session started! Waiting for Unity to upload the audio...')
    } catch (error) {
      setMessage('Error starting session: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleContinueToSurvey = async () => {
    try {
      const updatedSession = await sessionsAPI.updateSessionState(currentSession.id, 'survey_pending')
      setCurrentSession(updatedSession)
      setMessage('Please fill out the survey.')
    } catch (error) {
      setMessage('Error continuing to survey: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSurveySubmitted = () => {
    setCurrentSession((prev) => {
      if (!prev) return prev
      return { ...prev, estado: 'completed' }
    })
    setMessage('Session completed successfully')
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
          setCurrentSession((prev) => {
            if (prev?.estado === 'running' && latest?.estado === 'audio_uploaded') {
              setMessage('Audio received successfully')
            }
            return latest
          })
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

  window.currentSession = currentSession  // For debugging purposes

  return (
    <div className="container">
      <h1>IMPULSADOR Dashboard</h1>
      <p>Create and manage training sessions</p>

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
          <h2>Current Session</h2>
          <p>
            <strong>Session Code:</strong> {currentSession.session_code}{' '}
            {currentSession.estado !== 'running' && (
              <button
                type="button"
                onClick={handleCopySessionCode}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '14px', marginLeft: '8px' }}
              >
                Copy
              </button>
            )}
          </p>
          <p><strong>Participant:</strong> {currentSession.datos_participante.nombre}</p>
          <p><strong>State:</strong> {currentSession.estado}</p>
          <p><strong>Training Text:</strong></p>
          <p style={{backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px'}}>
            {currentSession.texto_seleccionado}
          </p>

          <div style={{marginTop: '20px'}}>
            {currentSession.estado === 'created' && (
              <button onClick={handleStartSession} className="btn btn-primary">
                Start Session
              </button>
            )}
            
            {currentSession.estado === 'running' && (
              <>
                <p><strong>Waiting for Unity to upload audio...</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                  <div className="loader" aria-label="Loading" />
                  <p style={{ margin: 0 }}>
                    The simulation is in progress. Audio will be uploaded automatically when finished.
                  </p>
                </div>
                {lastCheck && (
                  <p style={{ marginTop: '8px' }}>
                    <strong>Last check:</strong> {lastCheck.toLocaleTimeString()}
                  </p>
                )}
              </>
            )}
            
            {currentSession.estado === 'audio_uploaded' && (
              <>
                <p><strong>Audio received successfully</strong></p>
                <button onClick={handleContinueToSurvey} className="btn btn-primary">
                  Continue to Survey
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
          <h2>Session completed successfully</h2>
          <p><strong>Session Code:</strong> {currentSession.session_code}</p>
          <p><strong>State:</strong> {currentSession.estado}</p>
        </div>
      )}
    </div>
  )
}

export default ImpulsorPage
