import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  function entrar(dados) {
    localStorage.setItem('token', dados.token)
    localStorage.setItem('usuario', JSON.stringify(dados))
    setUsuario(dados)
  }

  function sair() {
    localStorage.clear()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}