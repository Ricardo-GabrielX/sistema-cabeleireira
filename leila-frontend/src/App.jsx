import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PrivateRoute from '@/components/PrivateRoute'

// Pages
import Login from '@/pages/Login/Login'
import Cadastro from '@/pages/Cadastro/Cadastro'
import NovoAgendamento from '@/pages/cliente/NovoAgendamento/NovoAgendamento'
import MeusAgendamentos from '@/pages/cliente/MeusAgendamentos/MeusAgendamentos'
import Dashboard from '@/pages/cabeleireira/Dashboard/Dashboard'
import Agendamentos from '@/pages/cabeleireira/Agendamentos/Agendamentos'
import Servicos from '@/pages/cabeleireira/Servicos/Servicos'

function App() {
  const { usuario } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      {/* Root Redirection */}
      <Route 
        path="/" 
        element={<Navigate to={usuario ? (usuario.role === 'CABELEIREIRA' ? '/dashboard' : '/agendar') : '/login'} replace />} 
      />

      {/* Cliente Routes */}
      <Route path="/agendar" element={
        <PrivateRoute role="CLIENTE">
          <NovoAgendamento />
        </PrivateRoute>
      } />
      <Route path="/meus-agendamentos" element={
        <PrivateRoute role="CLIENTE">
          <MeusAgendamentos />
        </PrivateRoute>
      } />

      {/* Cabeleireira Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute role="CABELEIREIRA">
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/agendamentos" element={
        <PrivateRoute role="CABELEIREIRA">
          <Agendamentos />
        </PrivateRoute>
      } />
      <Route path="/servicos" element={
        <PrivateRoute role="CABELEIREIRA">
          <Servicos />
        </PrivateRoute>
      } />

      {/* 404 - Optional */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App