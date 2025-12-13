import React from 'react'

function SessionList({ sessions }) {
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

  return (
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
            <td>{session.surveys_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SessionList
