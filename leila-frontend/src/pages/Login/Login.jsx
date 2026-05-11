import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { login } from '@/api/auth'
import { Scissors } from 'lucide-react'
import Button from '@/components/Button/Button'
import styles from './Login.module.css'

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await login(form)
      entrar(data)
      navigate(data.role === 'CABELEIREIRA' ? '/dashboard' : '/agendar')
    } catch (err) {
      setErro(err.response?.data?.message || 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Scissors size={32} className={styles.icon} />
          <h1 className={styles.title}>Cabeleleila Leila</h1>
          <p className={styles.subtitle}>Entre na sua conta</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input className={styles.input} type="password" placeholder="••••••••"
              value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          </div>
          {erro && <p className={styles.erro}>{erro}</p>}
          <Button type="submit" full disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className={styles.footer}>
            Não tem conta?{' '}
            <Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  )
}