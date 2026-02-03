import { useMemo, useState, useEffect } from 'react'
import SessionList from '../components/SessionList'
import { datasetAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import InlineMessage from '../components/ui/InlineMessage'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { mapApiError } from '../api/errors'

function AnalistaPage() {
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [codeQuery, setCodeQuery] = useState('')

  useEffect(() => {
    loadDataset()
  }, [])

  const loadDataset = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await datasetAPI.getDataset()
      setDataset(data)
    } catch (err) {
      setError(mapApiError(err, UI_COPY.analista.datasetError))
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
      link.download = 'dataset_export.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(mapApiError(err, UI_COPY.analista.exportError))
    }
  }

  const filteredSessions = useMemo(() => {
    if (!dataset?.dataset) return []

    const query = codeQuery.trim().toLowerCase()
    return dataset.dataset.filter((session) => {
      const matchesState = stateFilter === 'all' ? true : session.estado === stateFilter
      const matchesCode = query ? session.session_code?.toLowerCase().includes(query) : true
      return matchesState && matchesCode
    })
  }, [dataset, stateFilter, codeQuery])

  return (
    <Layout title={UI_COPY.analista.title} subtitle={UI_COPY.analista.subtitle}>

      {error && (
        <Card>
          <InlineMessage variant="error">
            {error}
            <Button variant="secondary" size="sm" onClick={loadDataset}>
              {UI_COPY.common.retry}
            </Button>
          </InlineMessage>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title">{UI_COPY.analista.datasetTitle}</h2>
          <Button onClick={handleExportCSV} variant="primary">
            {UI_COPY.analista.exportCsv}
          </Button>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
          <strong>{UI_COPY.analista.filtersTitle}</strong>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Select
              id="filter-state"
              label={UI_COPY.analista.filterState}
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
            >
              <option value="all">{UI_COPY.analista.filterAll}</option>
              {Object.entries(UI_COPY.stateLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <Input
              id="filter-code"
              label={UI_COPY.analista.filterCode}
              value={codeQuery}
              onChange={(event) => setCodeQuery(event.target.value)}
              placeholder={UI_COPY.analista.filterCodePlaceholder}
            />
          </div>
        </div>

        {loading ? (
          <p>{UI_COPY.analista.loadingDataset}</p>
        ) : dataset ? (
          <>
            <p><strong>{UI_COPY.analista.totalSessions}:</strong> {filteredSessions.length}</p>
            <SessionList sessions={filteredSessions} />
          </>
        ) : (
          <p>{UI_COPY.analista.noDataset}</p>
        )}
      </Card>

      <Card title={UI_COPY.analista.statsTitle}>
        {dataset && (
          <div>
            <p><strong>{UI_COPY.analista.completedSessions}:</strong> {dataset.dataset.filter(s => s.estado === 'completed').length}</p>
            <p><strong>{UI_COPY.analista.totalRecordings}:</strong> {dataset.dataset.reduce((sum, s) => sum + s.recordings_count, 0)}</p>
            <p><strong>{UI_COPY.analista.totalSurveys}:</strong> {dataset.dataset.reduce((sum, s) => sum + s.surveys_count, 0)}</p>
          </div>
        )}
      </Card>
    </Layout>
  )
}

export default AnalistaPage
