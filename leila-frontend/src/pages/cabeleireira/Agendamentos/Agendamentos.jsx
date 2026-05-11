import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import StatusBadge from '@/components/StatusBadge/StatusBadge'
import Button from '@/components/Button/Button'
import { listarTodos, alterarStatus } from '@/api/agendamentos'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './Agendamentos.module.css'

const hoje = new Date().toISOString().split('T')[0]

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [inicio, setInicio] = useState(hoje)
  const [fim, setFim] = useState(hoje)
  const [loading, setLoading] = useState(false)

  async function buscar() {
    setLoading(true)
    try {
      const { data } = await listarTodos(inicio, fim)
      setAgendamentos(data)
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
  buscar() 
  }, [])

  async function handleStatus(id, status) {
    await alterarStatus(id, status)
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  return (
    <Layout>
      <h1 className={styles.title}>Agendamentos</h1>

      <div className={styles.filtros}>
        <div className={styles.field}>
          <label className={styles.label}>De</label>
          <input className={styles.input} type="date" value={inicio}
            onChange={e => setInicio(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Até</label>
          <input className={styles.input} type="date" value={fim}
            onChange={e => setFim(e.target.value)} />
        </div>
        <Button onClick={buscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {agendamentos.length === 0 && !loading && (
        <p className={styles.vazio}>Nenhum agendamento no período.</p>
      )}

      {agendamentos.map(a => (
        <div key={a.id} className={styles.card}>
          <div className={styles.cardTop}>
            <div>
              <p className={styles.clienteNome}>{a.clienteNome}</p>
              <p className={styles.clienteTel}>{a.clienteTelefone}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
          <p className={styles.data}>
            {format(new Date(a.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          <div className={styles.servicos}>
            {a.servicos.map(s => <span key={s.id} className={styles.tag}>{s.nome}</span>)}
          </div>
          {a.observacao && <p className={styles.obs}>"{a.observacao}"</p>}
          {a.status === 'PENDENTE' && (
            <div className={styles.acoes}>
              <Button size="sm" variant="success" onClick={() => handleStatus(a.id, 'CONFIRMADO')}>
                Confirmar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleStatus(a.id, 'CANCELADO')}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      ))}
    </Layout>
  )
}