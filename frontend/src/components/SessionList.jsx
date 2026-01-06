import React, { useState } from 'react'
import { sessionsAPI } from '../api/sessions'

function SessionList({ sessions }) {
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [surveyLoading, setSurveyLoading] = useState(false)
  const [surveyError, setSurveyError] = useState('')

  if (!sessions || sessions.length === 0) {
    return <p>No sessions found.</p>
  }

  const getStateLabel = (estado) => {
    const labels = {
      'created': 'Created',
      'ready_to_start': 'Ready to Start',
      'running': 'Running',
      'audio_uploaded': 'Audio Uploaded',
      'survey_pending': 'Survey Pending',
      'completed': 'Completed'
    }
    return labels[estado] || estado
  }

  const getStateColor = (estado) => {
    const colors = {
      'created': '#6c757d',
      'ready_to_start': '#007bff',
      'running': '#ffc107',
      'audio_uploaded': '#17a2b8',
      'survey_pending': '#fd7e14',
      'completed': '#28a745'
    }
    return colors[estado] || '#6c757d'
  }

  const handleViewSurveys = async (sessionId, participantName) => {
    setSurveyLoading(true)
    setSurveyError('')
    try {
      const surveys = await sessionsAPI.getSurveys(sessionId)
      setSelectedSurvey({ surveys, participantName })
    } catch (err) {
      setSurveyError(err.response?.data?.detail || 'Failed to load survey details')
    } finally {
      setSurveyLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedSurvey(null)
    setSurveyError('')
  }

  return (
    <>
    <table className="table">
      <thead>
        <tr>
          <th>Session Code</th>
          <th>Participant</th>
          <th>Age</th>
          <th>State</th>
          <th>Created At</th>
          <th>Recordings</th>
          <th>Surveys</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <tr key={session.session_id}>
            <td><strong>{session.session_code}</strong></td>
            <td>{session.participant_name}</td>
            <td>{session.participant_age || 'N/A'}</td>
            <td>
              <span style={{
                backgroundColor: getStateColor(session.estado),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {getStateLabel(session.estado)}
              </span>
            </td>
            <td>{new Date(session.created_at).toLocaleString()}</td>
            <td>{session.recordings_count}</td>
            <td>
              {session.surveys_count > 0 ? (
                <button
                  onClick={() => handleViewSurveys(session.session_id, session.participant_name)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  disabled={surveyLoading}
                >
                  {surveyLoading ? 'Loading...' : 'More details'}
                </button>
              ) : (
                <span style={{ color: '#6c757d', fontSize: '12px' }}>No surveys</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Survey Details Modal */}
    {selectedSurvey && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={closeModal}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Survey Results - {selectedSurvey.participantName}</h3>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          {selectedSurvey.surveys.length === 0 ? (
            <p>No survey responses found.</p>
          ) : (
            selectedSurvey.surveys.map((survey, index) => (
              <div key={survey.id} style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                {selectedSurvey.surveys.length > 1 && (
                  <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Survey #{index + 1}</h4>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  Submitted: {new Date(survey.created_at).toLocaleString()}
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(survey.respuestas_json).map(([key, value]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', width: '40%' }}>
                          {key}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {value || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          <button
            onClick={closeModal}
            className="btn"
            style={{ marginTop: '16px', width: '100%' }}
          >
            Close
          </button>
        </div>
      </div>
    )}

    {surveyError && (
      <div style={{ color: 'red', marginTop: '10px' }}>{surveyError}</div>
    )}
    </>
  )
}

export default SessionList
