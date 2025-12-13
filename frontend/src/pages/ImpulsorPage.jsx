import React, { useState } from 'react'
import SessionForm from '../components/SessionForm'
import SurveyForm from '../components/SurveyForm'
import { sessionsAPI } from '../api/sessions'

function ImpulsorPage() {
  const [currentSession, setCurrentSession] = useState(null)
  const [showSurvey, setShowSurvey] = useState(false)
  const [message, setMessage] = useState('')

  const handleSessionCreated = (session) => {
    setCurrentSession(session)
    setMessage(`Session created successfully! Session Code: ${session.session_code}`)
  }

  const handleStartSession = async () => {
    try {
      await sessionsAPI.updateSessionState(currentSession.id, 'ready_to_start')
      await sessionsAPI.updateSessionState(currentSession.id, 'running')
      setMessage('Session started! You can now record your audio.')
    } catch (error) {
      setMessage('Error starting session: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleUploadAudio = async () => {
    // Mock upload
    try {
      await sessionsAPI.uploadRecording(currentSession.id, {
        audio_url: '/mock-audio.wav',
        duracion_segundos: 120,
        formato: 'wav'
      })
      await sessionsAPI.updateSessionState(currentSession.id, 'survey_pending')
      setMessage('Audio uploaded successfully! Please fill out the survey.')
      setShowSurvey(true)
    } catch (error) {
      setMessage('Error uploading audio: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSurveySubmitted = () => {
    setMessage('Thank you! Your feedback has been submitted.')
    setShowSurvey(false)
    setCurrentSession(null)
  }

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

      {currentSession && !showSurvey && (
        <div className="card">
          <h2>Current Session</h2>
          <p><strong>Session Code:</strong> {currentSession.session_code}</p>
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
                <p>🎙️ Recording in progress (simulated)...</p>
                <button onClick={handleUploadAudio} className="btn btn-primary">
                  Upload Recording (Mock)
                </button>
              </>
            )}
            
            {currentSession.estado === 'audio_uploaded' && (
              <p>⏳ Processing audio...</p>
            )}
          </div>
        </div>
      )}

      {showSurvey && currentSession && (
        <SurveyForm 
          sessionId={currentSession.id}
          onSurveySubmitted={handleSurveySubmitted}
        />
      )}
    </div>
  )
}

export default ImpulsorPage
