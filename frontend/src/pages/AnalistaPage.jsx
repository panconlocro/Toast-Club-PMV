import { useState, useEffect } from 'react'
import SessionList from '../components/SessionList'
import { datasetAPI } from '../api/sessions'

function AnalistaPage() {
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDataset()
  }, [])

  const loadDataset = async () => {
    try {
      setLoading(true)
      const data = await datasetAPI.getDataset()
      setDataset(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dataset')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await datasetAPI.exportDataset()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'toastclub_dataset.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to export dataset')
    }
  }

  return (
    <div className="container">
      <h1>ANALISTA Dashboard</h1>
      <p>View and analyze training session data</p>

      {error && (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Training Sessions Dataset</h2>
          <button onClick={handleExportCSV} className="btn btn-primary">
            Export to CSV
          </button>
        </div>

        {loading ? (
          <p>Loading dataset...</p>
        ) : dataset ? (
          <>
            <p><strong>Total Sessions:</strong> {dataset.total_sessions}</p>
            <SessionList sessions={dataset.dataset} />
          </>
        ) : (
          <p>No data available.</p>
        )}
      </div>

      <div className="card">
        <h3>Dataset Statistics</h3>
        {dataset && (
          <div>
            <p><strong>Completed Sessions:</strong> {dataset.dataset.filter(s => s.estado === 'completed').length}</p>
            <p><strong>Total Recordings:</strong> {dataset.dataset.reduce((sum, s) => sum + s.recordings_count, 0)}</p>
            <p><strong>Total Surveys:</strong> {dataset.dataset.reduce((sum, s) => sum + s.surveys_count, 0)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalistaPage
