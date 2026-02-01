import { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ImpulsorPage from './pages/ImpulsorPage'
import AnalistaPage from './pages/AnalistaPage'
import { UI_COPY } from './uiCopy'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && role) {
      setIsAuthenticated(true)
      setUserRole(role)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setIsAuthenticated(false)
    setUserRole(null)
    navigate('/login')
  }

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="nav">
          <Link to={userRole === 'IMPULSADOR' ? '/impulsador' : '/analista'}>
            {UI_COPY.nav.home}
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary" style={{float: 'right'}}>
            {UI_COPY.nav.logout}
          </button>
        </nav>
      )}

      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={userRole === 'IMPULSADOR' ? '/impulsador' : '/analista'} />
            ) : (
              <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
            )
          } 
        />
        <Route 
          path="/impulsador" 
          element={
            isAuthenticated && userRole === 'IMPULSADOR' ? (
              <ImpulsorPage />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/analista" 
          element={
            isAuthenticated && userRole === 'ANALISTA' ? (
              <AnalistaPage />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
