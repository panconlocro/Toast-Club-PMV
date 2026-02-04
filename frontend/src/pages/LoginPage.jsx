import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/sessions'
import { UI_COPY } from '../uiCopy'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import InlineMessage from '../components/ui/InlineMessage'
import { mapApiError } from '../api/errors'

function LoginPage({ setIsAuthenticated, setUserRole, setMustChangePassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) {
      return
    }
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login(email, password)
      
      // Save token and role
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('role', data.rol)
      localStorage.setItem('must_change_password', data.must_change_password ? 'true' : 'false')
      
      setIsAuthenticated(true)
      setUserRole(data.rol)
      setMustChangePassword(Boolean(data.must_change_password))
      
      // Navigate based on role
      if (data.must_change_password) {
        navigate('/change-password')
      } else if (data.rol === 'IMPULSADOR') {
        navigate('/impulsador')
      } else if (data.rol === 'ANALISTA') {
        navigate('/analista')
      }
    } catch (err) {
      setError(mapApiError(err, UI_COPY.login.error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={UI_COPY.login.title} subtitle={UI_COPY.login.subtitle}>
      <Card className="login-card" title="Acceso">
        
        <form onSubmit={handleSubmit} className="ui-form">
          <Input
            id="email"
            label={UI_COPY.login.emailLabel}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="impulsador@toastclub.com"
          />
          
          <Input
            id="password"
            label={UI_COPY.login.passwordLabel}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <InlineMessage variant="error">{error}</InlineMessage>}
          
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? UI_COPY.login.submitting : UI_COPY.login.submit}
          </Button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>{UI_COPY.login.testAccountsTitle}:</strong></p>
          <p>{UI_COPY.login.impulsorAccount}</p>
          <p>{UI_COPY.login.analistaAccount}</p>
        </div>
      </Card>
    </Layout>
  )
}

export default LoginPage
