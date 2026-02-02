import { useEffect, useRef, useState } from 'react'
import SessionForm from '../components/SessionForm'
import SurveyForm from '../components/SurveyForm'
import { sessionsAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import InlineMessage from '../components/ui/InlineMessage'
import Spinner from '../components/ui/Spinner'
import { mapApiError } from '../api/errors'

function ImpulsorPage() {
  const [currentSession, setCurrentSession] = useState(null)
  const [message, setMessage] = useState('')
  const [lastCheck, setLastCheck] = useState(null)
  const pollingTimeoutRef = useRef(null)
  const pollingFailuresRef = useRef(0)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
    }
  }, [])

  const handleCreateNewSession = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    pollingFailuresRef.current = 0
    setCurrentSession(null)
    setLastCheck(null)
    setMessage('')
  }

  const handleSessionCreated = (session) => {
    setCurrentSession(session)
    setMessage(UI_COPY.impulsor.successCreated)
  }

  useEffect(() => {
    if (message === UI_COPY.impulsor.successCreated && currentSession?.estado !== 'created') {
      setMessage('')
    }
  }, [currentSession?.estado, message])

  const hasSession = Boolean(currentSession)
  const isCreated = currentSession?.estado === 'created'
  const isRunning = currentSession?.estado === 'running'
  const isAudioUploaded = currentSession?.estado === 'audio_uploaded'
  const isSurveyPending = currentSession?.estado === 'survey_pending'
  const isCompleted = currentSession?.estado === 'completed'

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
      setMessage(`${UI_COPY.impulsor.startError}: ${mapApiError(error)}`)
    }
  }

  const handleContinueToSurvey = async () => {
    try {
      const updatedSession = await sessionsAPI.updateSessionState(currentSession.id, 'survey_pending')
      setCurrentSession(updatedSession)
    } catch (error) {
      setMessage(`${UI_COPY.impulsor.continueError}: ${mapApiError(error)}`)
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
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
      pollingFailuresRef.current = 0
      return
    }

    let cancelled = false

    const pollOnce = async () => {
      try {
        const latest = await sessionsAPI.getSession(sessionId)
        if (!isMountedRef.current || cancelled) return
        pollingFailuresRef.current = 0
        setCurrentSession(() => latest)
        setLastCheck(new Date())
      } catch (error) {
        pollingFailuresRef.current += 1
        console.warn('Polling failed:', error?.message || error)
      }

      if (!isMountedRef.current || cancelled) return

      const baseDelay = 2500
      const backoffDelay = Math.min(10000, baseDelay + pollingFailuresRef.current * 1500)
      pollingTimeoutRef.current = setTimeout(pollOnce, backoffDelay)
    }

    // Kick off the polling loop (avoid duplicate timers).
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    pollOnce()

    return () => {
      cancelled = true
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
    }
  }, [currentSession?.id, currentSession?.estado])

  return (
    <Layout title={UI_COPY.impulsor.title} subtitle={UI_COPY.impulsor.subtitle}>

      {!hasSession && (
        <Card title="Crear sesión">
          <SessionForm onSessionCreated={handleSessionCreated} />
        </Card>
      )}

      {hasSession && (
        <Card title="Código de sesión">
          {message && <InlineMessage variant="success">{message}</InlineMessage>}
          <p>
            <strong>{UI_COPY.impulsor.sessionCode}:</strong> {currentSession.session_code}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopySessionCode}
              aria-label={`${UI_COPY.impulsor.copy}: ${currentSession.session_code}`}
              style={{ marginLeft: '8px' }}
            >
              {UI_COPY.impulsor.copy}
            </Button>
          </p>
          <p><strong>{UI_COPY.impulsor.participant}:</strong> {currentSession.datos_participante.nombre}</p>
          <p><strong>{UI_COPY.impulsor.trainingText}:</strong> {currentSession.texto_seleccionado?.Title || UI_COPY.impulsor.noTextSelected}</p>
          {isCreated && (
            <Button onClick={handleStartSession} variant="primary">
              {UI_COPY.impulsor.startButton}
            </Button>
          )}
        </Card>
      )}

      {hasSession && !isCompleted && (
        <Card title="Estado actual">
          <InlineMessage variant="info">
            <strong>{UI_COPY.impulsor.state}:</strong> {UI_COPY.stateLabels[currentSession.estado] || currentSession.estado}
          </InlineMessage>

          {isRunning && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Spinner label={UI_COPY.common.loading} />
                <span>{UI_COPY.impulsor.waitingAudioBody}</span>
              </div>
              {lastCheck && (
                <span style={{ fontSize: '0.85rem', color: '#5f6b7a' }}>
                  {UI_COPY.impulsor.lastCheck}: {lastCheck.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}

          {isAudioUploaded && (
            <InlineMessage variant="success">
              {UI_COPY.impulsor.audioReceived}
            </InlineMessage>
          )}

          {isAudioUploaded && (
            <Button onClick={handleContinueToSurvey} variant="primary">
              {UI_COPY.impulsor.continueToSurvey}
            </Button>
          )}
        </Card>
      )}

      {(isAudioUploaded || isSurveyPending) && (
        <Card title="Encuesta">
          {isSurveyPending ? (
            <SurveyForm
              sessionId={currentSession.id}
              onSurveySubmitted={handleSurveySubmitted}
            />
          ) : (
            <InlineMessage variant="info">
              {UI_COPY.impulsor.continueToSurvey}
            </InlineMessage>
          )}
        </Card>
      )}

      {isCompleted && (
        <Card title={UI_COPY.impulsor.completedTitle}>
          <p><strong>{UI_COPY.impulsor.sessionCode}:</strong> {currentSession.session_code}</p>
          <p><strong>{UI_COPY.impulsor.participant}:</strong> {currentSession.datos_participante?.nombre}</p>
          <Button onClick={handleCreateNewSession} variant="primary">
            {UI_COPY.impulsor.newSession}
          </Button>
        </Card>
      )}
    </Layout>
  )
}

export default ImpulsorPage
