import React, { useEffect, useRef, useState } from 'react'
import SessionForm from '../components/SessionForm'
import SurveyForm from '../components/SurveyForm'
import { sessionsAPI } from '../api/sessions'

function ImpulsorPage() {
  const [currentSession, setCurrentSession] = useState(null)
  const [message, setMessage] = useState('')
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

  const handleSurveySubmitted = () => {
    setMessage('Thank you! Your feedback has been submitted.')
    setCurrentSession(null)
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
          setCurrentSession(latest)
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

      {currentSession && currentSession.estado !== 'survey_pending' && (
        <div className="card">
          <h2>Current Session</h2>
          <p>
            <strong>Session Code:</strong> {currentSession.session_code}{' '}
            <button
              type="button"
              onClick={handleCopySessionCode}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '14px', marginLeft: '8px' }}
            >
              Copy
            </button>
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
                <p>Session is running. Unity will upload the audio via backend.</p>
              </>
            )}
            
            {currentSession.estado === 'audio_uploaded' && (
              <p>Audio uploaded. Waiting for survey...</p>
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
    </div>
  )
}

export default ImpulsorPage
