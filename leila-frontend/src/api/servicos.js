import api from './axios'

export const listarServicos = () => api.get('/api/servicos')
export const criarServico = (data) => api.post('/api/servicos/admin', data)
export const atualizarServico = (id, data) => api.put(`/api/servicos/admin/${id}`, data)
export const deletarServico = (id) => api.delete(`/api/servicos/admin/${id}`)