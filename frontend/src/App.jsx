import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ImpulsorPage from './pages/ImpulsorPage'
import AnalistaPage from './pages/AnalistaPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import { UI_COPY } from './uiCopy'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const mustChange = localStorage.getItem('must_change_password')
    if (token && role) {
      setIsAuthenticated(true)
      setUserRole(role)
      setMustChangePassword(mustChange === 'true')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('must_change_password')
    setIsAuthenticated(false)
    setUserRole(null)
    setMustChangePassword(false)
    navigate('/login')
  }

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="nav">
          {userRole === 'ANALISTA' && (
            <Link to="/admin/users">Usuarios</Link>
          )}
          <button onClick={handleLogout} className="btn btn-secondary nav__logout">
            {UI_COPY.nav.logout}
          </button>
        </nav>
      )}

      {isAuthenticated && mustChangePassword && location.pathname !== '/change-password' && (
        <Navigate to="/change-password" />
      )}

      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={mustChangePassword ? '/change-password' : (userRole === 'IMPULSADOR' ? '/impulsador' : '/analista')} />
            ) : (
              <LoginPage
                setIsAuthenticated={setIsAuthenticated}
                setUserRole={setUserRole}
                setMustChangePassword={setMustChangePassword}
              />
            )
          } 
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated ? (
              <ChangePasswordPage setMustChangePassword={setMustChangePassword} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route 
          path="/impulsador" 
          element={
            isAuthenticated && userRole === 'IMPULSADOR' && !mustChangePassword ? (
              <ImpulsorPage />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/analista" 
          element={
            isAuthenticated && userRole === 'ANALISTA' && !mustChangePassword ? (
              <AnalistaPage />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            isAuthenticated && userRole === 'ANALISTA' && !mustChangePassword ? (
              <AdminUsersPage />
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
