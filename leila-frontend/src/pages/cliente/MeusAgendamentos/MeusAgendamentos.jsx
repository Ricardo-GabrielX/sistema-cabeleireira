import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import StatusBadge from '@/components/StatusBadge/StatusBadge'
import Button from '@/components/Button/Button'
import { meusAgendamentos, atualizarAgendamentoCliente } from '@/api/agendamentos'
import { listarServicos } from '@/api/servicos'
import { CalendarDays, Clock, Scissors, Pencil, Phone, AlertCircle } from 'lucide-react'
import { format, parseISO, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './MeusAgendamentos.module.css'

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [todosServicos, setTodosServicos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal de edição
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ dataHora: '', servicoIds: [], observacao: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregarAgendamentos() {
    setLoading(true)
    try {
      const { data } = await meusAgendamentos()
      setAgendamentos(data)
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
    } finally {
      setLoading(false)
    }
  }

  async function carregarServicos() {
    try {
      const { data } = await listarServicos()
      setTodosServicos(data)
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    }
  }

  useEffect(() => {
    carregarAgendamentos()
    carregarServicos()
  }, [])

  function podeEditar(dataHora, status) {
    if (status === 'CANCELADO') return false
    
    const dataAgendamento = parseISO(dataHora)
    const limiteDoisDias = addDays(new Date(), 2)
    
    // Retorna true se a data do agendamento é DEPOIS do limite (mais de 2 dias)
    return dataAgendamento > limiteDoisDias
  }

  function abrirModal(agendamento) {
    setEditando(agendamento)
    setForm({
      dataHora: agendamento.dataHora.slice(0, 16), // formato datetime-local
      servicoIds: agendamento.servicos.map(s => s.id),
      observacao: agendamento.observacao || '',
    })
    setErro('')
    setModalAberto(true)
  }

  function toggleServico(id) {
    setForm(prev => ({
      ...prev,
      servicoIds: prev.servicoIds.includes(id)
        ? prev.servicoIds.filter(s => s !== id)
        : [...prev.servicoIds, id]
    }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    
    if (form.servicoIds.length === 0) {
      setErro('Selecione ao menos um serviço')
      return
    }

    setErro('')
    setSalvando(true)

    try {
      const payload = {
        dataHora: new Date(form.dataHora).toISOString().slice(0, 19),
        servicoIds: form.servicoIds,
        observacao: form.observacao,
      }

      await atualizarAgendamentoCliente(editando.id, payload)
      
      // Atualiza a lista
      await carregarAgendamentos()
      setModalAberto(false)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao atualizar agendamento')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meus agendamentos</h1>
          <Button onClick={carregarAgendamentos} disabled={loading}>
            🔄 Recarregar
          </Button>
        </div>

        {loading && <p className={styles.vazio}>Carregando...</p>}

        {!loading && agendamentos.length === 0 && (
          <div className={styles.vazio}>Nenhum agendamento encontrado.</div>
        )}

        {agendamentos.map(a => {
          const permiteEdicao = podeEditar(a.dataHora, a.status)
          
          return (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.data}>
                  <CalendarDays size={15} />
                  {format(parseISO(a.dataHora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  <Clock size={15} style={{ marginLeft: 8 }} />
                  {format(parseISO(a.dataHora), 'HH:mm')}
                </div>
                <div className={styles.cardActions}>
                  <StatusBadge status={a.status} />
                  {permiteEdicao && (
                    <button
                      className={styles.btnEditar}
                      onClick={() => abrirModal(a)}
                      title="Editar agendamento"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.servicos}>
                <Scissors size={14} color="var(--pink)" />
                {a.servicos.map(s => (
                  <span key={s.id} className={styles.tag}>{s.nome}</span>
                ))}
              </div>
              
              {a.observacao && <p className={styles.obs}>"{a.observacao}"</p>}

              {/* Aviso se não puder editar */}
              {!permiteEdicao && a.status !== 'CANCELADO' && (
                <div className={styles.avisoTelefone}>
                  <Phone size={14} />
                  <span>
                    Alterações em agendamentos com menos de 2 dias devem ser feitas por telefone: <strong>(11) 98765-4321</strong>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de edição */}
      {modalAberto && (
        <div className={styles.overlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p className={styles.modalTitle}>Editar agendamento</p>

            <div className={styles.aviso}>
              <AlertCircle size={16} />
              <span>
                Você pode alterar este agendamento porque faltam mais de 2 dias para a data marcada.
              </span>
            </div>

            <form className={styles.form} onSubmit={handleSalvar}>
              <div className={styles.field}>
                <label className={styles.label}>Data e horário</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.dataHora}
                  onChange={e => setForm({ ...form, dataHora: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Serviços</label>
                <div className={styles.servicoGrid}>
                  {todosServicos.map(s => (
                    <label 
                      key={s.id} 
                      className={`${styles.servicoCheckbox} ${form.servicoIds.includes(s.id) ? styles.servicoCheckboxAtivo : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.servicoIds.includes(s.id)}
                        onChange={() => toggleServico(s.id)}
                      />
                      <span className={styles.servicoLabel}>
                        {s.nome}
                        <br />
                        <small style={{ color: 'var(--gray-400)', fontSize: '11px' }}>
                          R$ {Number(s.preco).toFixed(2)}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Observação (opcional)</label>
                <input
                  className={styles.input}
                  value={form.observacao}
                  onChange={e => setForm({ ...form, observacao: e.target.value })}
                  placeholder="Ex: cabelo longo, alergia..."
                />
              </div>

              {erro && <div className={styles.erro}>{erro}</div>}

              <div className={styles.modalAcoes}>
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}