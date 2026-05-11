import api from './axios'

export const criarAgendamento = (data) => api.post('/api/agendamentos', data)
export const meusAgendamentos = () => api.get('/api/agendamentos/meus')
export const atualizarAgendamentoCliente = (id, data) => 
  api.put(`/api/agendamentos/${id}/cliente`, data)

export const listarTodos = (inicio, fim) =>
  api.get('/api/agendamentos/todos', { params: { inicio, fim } })
export const atualizarAgendamentoCabeleireira = (id, data) =>
  api.put(`/api/agendamentos/${id}/cabeleireira`, data)
export const alterarStatus = (id, status) =>
  api.patch(`/api/agendamentos/${id}/status`, { status })

export const dashboardSemana = () => api.get('/api/dashboard/semana')