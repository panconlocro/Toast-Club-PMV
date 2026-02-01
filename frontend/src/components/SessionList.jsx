import { Fragment, useState } from 'react'
import { sessionsAPI, recordingsAPI } from '../api/sessions'

function SessionList({ sessions }) {
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [surveyLoading, setSurveyLoading] = useState(false)
  const [surveyError, setSurveyError] = useState('')
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const [recordingLinks, setRecordingLinks] = useState({})

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

  const toggleExpanded = (sessionId) => {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId))
  }

  const getRecordingEntry = (recordingId) => recordingLinks[recordingId]

  const fetchRecordingUrl = async (recordingId) => {
    setRecordingLinks((prev) => ({
      ...prev,
      [recordingId]: { url: '', loading: true, error: '' }
    }))

    try {
      const data = await recordingsAPI.getRecordingDownloadUrl(recordingId)
      setRecordingLinks((prev) => ({
        ...prev,
        [recordingId]: { url: data.download_url, loading: false, error: '' }
      }))
      return data.download_url
    } catch (err) {
      setRecordingLinks((prev) => ({
        ...prev,
        [recordingId]: {
          url: '',
          loading: false,
          error: err.response?.data?.detail || 'Failed to load recording'
        }
      }))
      return ''
    }
  }

  const getOrFetchRecordingUrl = async (recordingId) => {
    const existing = getRecordingEntry(recordingId)
    if (existing?.url) {
      return existing.url
    }
    return fetchRecordingUrl(recordingId)
  }

  const handleDownloadRecording = async (recordingId) => {
    const url = await getOrFetchRecordingUrl(recordingId)
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseTextoSeleccionado = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return { raw: value }
      }
    }
    return null
  }

  const renderTextInfo = (textoSeleccionado) => {
    const text = parseTextoSeleccionado(textoSeleccionado)
    if (!text) return <span>N/A</span>

    const tags = text.Tags || text.tags || {}
    return (
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        {text.Title && (
          <div><strong>{text.Title}</strong></div>
        )}
        {text.Id && (
          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>ID: {text.Id}</div>
        )}
        {Object.keys(tags).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {Object.entries(tags).map(([key, value]) => (
              <span
                key={key}
                style={{
                  backgroundColor: '#eef2f7',
                  color: '#445',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.75rem'
                }}
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        {text.raw && (
          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{text.raw}</div>
        )}
      </div>
    )
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
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <Fragment key={session.session_id}>
            <tr>
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
              <td>
                <button
                  onClick={() => toggleExpanded(session.session_id)}
                  style={{
                    backgroundColor: '#0d6efd',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {expandedSessionId === session.session_id ? 'Hide' : 'View'}
                </button>
              </td>
            </tr>
            {expandedSessionId === session.session_id && (
              <tr>
                <td colSpan={8}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <strong>Participant details</strong>
                      <div>Name: {session.participant_name || 'N/A'}</div>
                      <div>Email: {session.participant_email || 'N/A'}</div>
                      <div>Age: {session.participant_age || 'N/A'}</div>
                    </div>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      <strong>Training text</strong>
                      {renderTextInfo(session.texto_seleccionado)}
                    </div>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      <strong>Recordings</strong>
                      {session.recordings && session.recordings.length > 0 ? (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {session.recordings.map((recording, index) => {
                            const recordingId = typeof recording === 'object' ? recording.id : null
                            const recordingKey = recordingId || `${session.session_id}-${index}`
                            const entry = recordingId ? getRecordingEntry(recordingId) : null

                            return (
                              <div key={recordingKey} style={{ display: 'grid', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  {recordingId ? (
                                    <>
                                      <button
                                        onClick={() => fetchRecordingUrl(recordingId)}
                                        style={{
                                          backgroundColor: '#0d6efd',
                                          color: 'white',
                                          border: 'none',
                                          padding: '4px 10px',
                                          borderRadius: '4px',
                                          fontSize: '12px',
                                          cursor: 'pointer'
                                        }}
                                        disabled={entry?.loading}
                                      >
                                        {entry?.loading ? 'Loading...' : 'Preview'}
                                      </button>
                                      <button
                                        onClick={() => handleDownloadRecording(recordingId)}
                                        style={{
                                          backgroundColor: '#198754',
                                          color: 'white',
                                          border: 'none',
                                          padding: '4px 10px',
                                          borderRadius: '4px',
                                          fontSize: '12px',
                                          cursor: 'pointer'
                                        }}
                                        disabled={entry?.loading}
                                      >
                                        Download
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{ color: '#6c757d' }}>Missing recording id</span>
                                  )}
                                  {recording?.created_at && (
                                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                      {new Date(recording.created_at).toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                {entry?.error && (
                                  <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>
                                    {entry.error}
                                  </span>
                                )}

                                {entry?.url && (
                                  <div style={{ display: 'grid', gap: '6px' }}>
                                    <audio controls src={entry.url} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <span style={{ color: '#6c757d' }}>No recordings</span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
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
