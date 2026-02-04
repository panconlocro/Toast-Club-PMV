import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import InlineMessage from '../components/ui/InlineMessage'
import { authAPI } from '../api/sessions'
import { mapApiError } from '../api/errors'

function ChangePasswordPage({ setMustChangePassword }) {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      })
      localStorage.setItem('must_change_password', 'false')
      setMustChangePassword(false)
      setSuccess('Contraseña actualizada. Redirigiendo...')
      const role = localStorage.getItem('role')
      setTimeout(() => {
        if (role === 'IMPULSADOR') {
          navigate('/impulsador')
        } else if (role === 'ANALISTA') {
          navigate('/analista')
        } else {
          navigate('/login')
        }
      }, 400)
    } catch (err) {
      setError(mapApiError(err, 'No se pudo actualizar la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Cambiar contraseña" subtitle="Es obligatorio antes de continuar.">
      <Card title="Actualizar contraseña">
        <form onSubmit={handleSubmit} className="ui-form">
          <Input
            id="current_password"
            type="password"
            label="Contraseña actual"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="new_password"
            type="password"
            label="Nueva contraseña"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="confirm_password"
            type="password"
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            disabled={loading}
          />
          {error && <InlineMessage variant="error">{error}</InlineMessage>}
          {success && <InlineMessage variant="success">{success}</InlineMessage>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </form>
      </Card>
    </Layout>
  )
}

export default ChangePasswordPage
