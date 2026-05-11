import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cadastro } from '@/api/auth'
import Button from '@/components/Button/Button'
import styles from './Cadastro.module.css'

export default function Cadastro() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await cadastro({...form, role: 'CLIENTE'})
      entrar(data)
      navigate(data.role === 'CABELEIREIRA' ? '/dashboard' : '/agendar')
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>Preencha seus dados</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input className={styles.input} value={form.nome} onChange={set('nome')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Telefone</label>
            <input className={styles.input} value={form.telefone} onChange={set('telefone')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input className={styles.input} type="password" value={form.senha} onChange={set('senha')} required />
          </div>
          {erro && <p className={styles.erro}>{erro}</p>}
          <Button type="submit" full disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
          <p className={styles.footer}>
            Já tem conta?{' '}
            <Link to="/login" className={styles.link}>Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}