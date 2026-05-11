import api from './axios'

export const login = (data) => api.post('/api/auth/login', data)
export const cadastro = (data) => api.post('/api/auth/cadastro', data)