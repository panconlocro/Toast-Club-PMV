import { useState, useEffect } from 'react'
import SessionList from '../components/SessionList'
import { datasetAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'

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
      setError(err.response?.data?.detail || UI_COPY.analista.datasetError)
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
      setError(err.response?.data?.detail || UI_COPY.analista.exportError)
    }
  }

  return (
    <div className="container">
      <h1>{UI_COPY.analista.title}</h1>
      <p>{UI_COPY.analista.subtitle}</p>

      {error && (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{UI_COPY.analista.datasetTitle}</h2>
          <button onClick={handleExportCSV} className="btn btn-primary">
            {UI_COPY.analista.exportCsv}
          </button>
        </div>

        {loading ? (
          <p>{UI_COPY.analista.loadingDataset}</p>
        ) : dataset ? (
          <>
            <p><strong>{UI_COPY.analista.totalSessions}:</strong> {dataset.total_sessions}</p>
            <SessionList sessions={dataset.dataset} />
          </>
        ) : (
          <p>{UI_COPY.analista.noDataset}</p>
        )}
      </div>

      <div className="card">
        <h3>{UI_COPY.analista.statsTitle}</h3>
        {dataset && (
          <div>
            <p><strong>{UI_COPY.analista.completedSessions}:</strong> {dataset.dataset.filter(s => s.estado === 'completed').length}</p>
            <p><strong>{UI_COPY.analista.totalRecordings}:</strong> {dataset.dataset.reduce((sum, s) => sum + s.recordings_count, 0)}</p>
            <p><strong>{UI_COPY.analista.totalSurveys}:</strong> {dataset.dataset.reduce((sum, s) => sum + s.surveys_count, 0)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalistaPage
