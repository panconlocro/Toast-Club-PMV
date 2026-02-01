import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'
import Layout from '../components/Layout'

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login(email, password)
      
      // Save token and role
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('role', data.rol)
      
      setIsAuthenticated(true)
      setUserRole(data.rol)
      
      // Navigate based on role
      if (data.rol === 'IMPULSADOR') {
        navigate('/impulsador')
      } else if (data.rol === 'ANALISTA') {
        navigate('/analista')
      }
    } catch (err) {
      setError(err.response?.data?.detail || UI_COPY.login.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={UI_COPY.login.title} subtitle={UI_COPY.login.subtitle}>
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h2 className="section-title">Acceso</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{UI_COPY.login.emailLabel}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="impulsador@toastclub.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{UI_COPY.login.passwordLabel}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? UI_COPY.login.submitting : UI_COPY.login.submit}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>{UI_COPY.login.testAccountsTitle}:</strong></p>
          <p>{UI_COPY.login.impulsorAccount}</p>
          <p>{UI_COPY.login.analistaAccount}</p>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage
