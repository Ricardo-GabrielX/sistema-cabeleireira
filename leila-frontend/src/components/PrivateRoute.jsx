import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function PrivateRoute({ children, role }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (role && usuario.role !== role) return <Navigate to="/login" replace />

  return children
}