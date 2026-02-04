import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import InlineMessage from '../components/ui/InlineMessage'
import { adminUsersAPI } from '../api/sessions'
import { mapApiError } from '../api/errors'

const ROLE_OPTIONS = [
  { value: 'ANALISTA', label: 'ANALISTA' },
  { value: 'IMPULSADOR', label: 'IMPULSADOR' }
]

function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [createEmail, setCreateEmail] = useState('')
  const [createRole, setCreateRole] = useState('ANALISTA')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createdTempPassword, setCreatedTempPassword] = useState('')

  const [resetInfo, setResetInfo] = useState(null)
  const [actionLoading, setActionLoading] = useState({ userId: null, action: '' })
  const [roleEdits, setRoleEdits] = useState({})
  const [actionError, setActionError] = useState('')

  const userRole = useMemo(() => localStorage.getItem('role'), [])

  useEffect(() => {
    if (userRole !== 'ANALISTA') {
      return
    }
    loadUsers()
  }, [userRole])

  const getAuthErrorMessage = (err) => {
    const status = err?.response?.status
    if (status === 401) return 'Sesión expirada. Inicia sesión nuevamente.'
    if (status === 403) return 'No tienes permisos para esta acción.'
    return ''
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await adminUsersAPI.listUsers()
      setUsers(data)
    } catch (err) {
      setError(getAuthErrorMessage(err) || mapApiError(err, 'No se pudo cargar usuarios.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    if (createLoading) return

    setCreateLoading(true)
    setCreateError('')
    setCreatedTempPassword('')

    try {
      const response = await adminUsersAPI.createUser({
        email: createEmail.trim(),
        role: createRole
      })
      setUsers((prev) => [response.user, ...prev])
      setCreatedTempPassword(response.temporary_password)
      setCreateEmail('')
      setCreateRole('ANALISTA')
    } catch (err) {
      setCreateError(getAuthErrorMessage(err) || mapApiError(err, 'No se pudo crear el usuario.'))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleResetPassword = async (userId) => {
    if (actionLoading.userId) return
    setActionLoading({ userId, action: 'reset' })
    setActionError('')
    setResetInfo(null)

    try {
      const response = await adminUsersAPI.resetPassword(userId)
      const user = users.find((item) => item.id === userId)
      setResetInfo({
        user,
        temporary_password: response.temporary_password
      })
    } catch (err) {
      setActionError(getAuthErrorMessage(err) || mapApiError(err, 'No se pudo resetear la contraseña.'))
    } finally {
      setActionLoading({ userId: null, action: '' })
    }
  }

  const handleToggleActive = async (user) => {
    if (actionLoading.userId) return
    if (user.is_active) {
      const confirmed = window.confirm(`¿Desactivar a ${user.email}?`)
      if (!confirmed) {
        return
      }
    }
    setActionLoading({ userId: user.id, action: 'toggle' })
    setActionError('')

    try {
      const updated = await adminUsersAPI.updateUser(user.id, { is_active: !user.is_active })
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
    } catch (err) {
      setActionError(getAuthErrorMessage(err) || mapApiError(err, 'No se pudo actualizar el usuario.'))
    } finally {
      setActionLoading({ userId: null, action: '' })
    }
  }

  const handleRoleChange = (userId, value) => {
    setRoleEdits((prev) => ({ ...prev, [userId]: value }))
  }

  const handleSaveRole = async (user) => {
    const newRole = roleEdits[user.id]
    if (!newRole || newRole === user.role) return
    if (actionLoading.userId) return

    setActionLoading({ userId: user.id, action: 'role' })
    setActionError('')

    try {
      const updated = await adminUsersAPI.updateUser(user.id, { role: newRole })
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
      setRoleEdits((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
    } catch (err) {
      setActionError(getAuthErrorMessage(err) || mapApiError(err, 'No se pudo actualizar el rol.'))
    } finally {
      setActionLoading({ userId: null, action: '' })
    }
  }

  const handleCopy = async (value) => {
    if (!value) return
    try {
      await navigator.clipboard?.writeText(value)
    } catch {
      // no-op
    }
  }

  if (userRole !== 'ANALISTA') {
    return (
      <Layout title="Administración" subtitle="Usuarios">
        <Card>
          <InlineMessage variant="error">No autorizado.</InlineMessage>
          <Button variant="secondary" onClick={() => navigate('/login')}>Volver</Button>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout title="Administración" subtitle="Usuarios">
      <Card title="Crear usuario">
        <form onSubmit={handleCreateUser} className="ui-form">
          <Input
            id="admin_user_email"
            label="Email"
            type="email"
            value={createEmail}
            onChange={(event) => setCreateEmail(event.target.value)}
            placeholder="usuario@toastclub.com"
            required
            disabled={createLoading}
          />
          <Select
            id="admin_user_role"
            label="Rol"
            value={createRole}
            onChange={(event) => setCreateRole(event.target.value)}
            disabled={createLoading}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </Select>
          {createError && <InlineMessage variant="error">{createError}</InlineMessage>}
          {createdTempPassword && (
            <InlineMessage variant="success">
              Contraseña temporal: <strong>{createdTempPassword}</strong>
              <span>El usuario debe cambiar la contraseña en el primer inicio de sesión.</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleCopy(createdTempPassword)}>
                Copiar
              </Button>
            </InlineMessage>
          )}
          <Button type="submit" variant="primary" disabled={createLoading}>
            {createLoading ? 'Creando...' : 'Crear'}
          </Button>
        </form>
      </Card>

      <Card title="Usuarios">
        {error && (
          <InlineMessage variant="error">
            {error}
            <Button variant="secondary" size="sm" onClick={loadUsers}>
              Reintentar
            </Button>
          </InlineMessage>
        )}

        {actionError && <InlineMessage variant="error">{actionError}</InlineMessage>}
        {resetInfo && (
          <InlineMessage variant="info">
            Contraseña temporal para <strong>{resetInfo.user?.email}</strong>: <strong>{resetInfo.temporary_password}</strong>
            <span>El usuario debe cambiar la contraseña en el primer inicio de sesión.</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleCopy(resetInfo.temporary_password)}>
              Copiar
            </Button>
          </InlineMessage>
        )}

        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <InlineMessage variant="info">No hay usuarios.</InlineMessage>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const pendingRole = roleEdits[user.id] ?? user.role
                const canSaveRole = pendingRole !== user.role
                const isRowLoading = actionLoading.userId === user.id

                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <Select
                        id={`role_${user.id}`}
                        value={pendingRole}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="admin-inline-select"
                        disabled={isRowLoading}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </Select>
                    </td>
                    <td>{user.is_active ? 'Activo' : 'Inactivo'}</td>
                    <td>
                      <div className="admin-actions">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isRowLoading}
                        >
                          {actionLoading.userId === user.id && actionLoading.action === 'reset' ? 'Reset...' : 'Reset password'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={isRowLoading}
                        >
                          {user.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveRole(user)}
                          disabled={!canSaveRole || isRowLoading}
                        >
                          Guardar rol
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </Layout>
  )
}

export default AdminUsersPage
