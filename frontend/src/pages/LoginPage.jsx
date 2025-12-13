import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/sessions'

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
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1>Toast Club PMV</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Password</label>
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>Test Accounts:</strong></p>
          <p>Impulsador: impulsador@toastclub.com / impulsador123</p>
          <p>Analista: analista@toastclub.com / analista123</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
