import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import StatusBadge from '@/components/StatusBadge/StatusBadge'
import Button from '@/components/Button/Button'
import { meusAgendamentos, atualizarAgendamentoCliente, horariosDisponiveis } from '@/api/agendamentos'
import { listarServicos } from '@/api/servicos'
import { CalendarDays, Clock, Scissors, Pencil, Phone, AlertCircle } from 'lucide-react'
import { format, parseISO, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './MeusAgendamentos.module.css'

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [todosServicos, setTodosServicos] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarios, setHorarios] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [observacao, setObservacao] = useState('')
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

  useEffect(() => {
    if (!dataSelecionada || !modalAberto) {
      setHorarios([])
      return
    }

    setCarregandoHorarios(true)
    
    horariosDisponiveis(dataSelecionada)
      .then(r => {
        const parsed = r.data.map(h => {
          const [horario, status] = h.split(':')
          const hora = horario
          const minuto = status.includes('OCUPADO') ? status.split(':')[0] : status
          return {
            hora: `${hora}:${minuto.padStart(2, '0')}`,
            disponivel: h.includes('DISPONIVEL')
          }
        })
        
        const horarioAtual = editando?.dataHora.slice(11, 16)
        const horariosAjustados = parsed.map(h => {
          if (h.hora === horarioAtual) {
            return { ...h, disponivel: true }
          }
          return h
        })
        
        setHorarios(horariosAjustados)
      })
      .catch(err => {
        console.error('Erro ao buscar horários:', err)
        setErro('Erro ao carregar horários disponíveis')
      })
      .finally(() => setCarregandoHorarios(false))
  }, [dataSelecionada, modalAberto, editando])

  function podeEditar(dataHora, status) {
    if (status === 'CANCELADO') return false
    
    const dataAgendamento = parseISO(dataHora)
    const limiteDoisDias = addDays(new Date(), 2)
    
    return dataAgendamento > limiteDoisDias
  }

  function abrirModal(agendamento) {
    setEditando(agendamento)
    
    const dataHoraObj = parseISO(agendamento.dataHora)
    setDataSelecionada(format(dataHoraObj, 'yyyy-MM-dd'))
    setHorarioSelecionado(format(dataHoraObj, 'HH:mm'))
    
    setServicosSelecionados(agendamento.servicos.map(s => s.id))
    setObservacao(agendamento.observacao || '')
    setErro('')
    setModalAberto(true)
  }

  function toggleServico(id) {
    setServicosSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSalvar(e) {
    e.preventDefault()
    
    if (servicosSelecionados.length === 0) {
      setErro('Selecione ao menos um serviço')
      return
    }

    if (!dataSelecionada || !horarioSelecionado) {
      setErro('Selecione uma data e um horário')
      return
    }

    setErro('')
    setSalvando(true)

    try {
      const dataHoraCompleta = `${dataSelecionada}T${horarioSelecionado}:00`

      const payload = {
        dataHora: dataHoraCompleta,
        servicoIds: servicosSelecionados,
        observacao,
      }

      await atualizarAgendamentoCliente(editando.id, payload)
      
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
                <label className={styles.label}>
                  <CalendarDays size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Selecione o dia
                </label>
                <input
                  className={styles.input}
                  type="date"
                  value={dataSelecionada}
                  onChange={e => {
                    setDataSelecionada(e.target.value)
                    setHorarioSelecionado('') // Limpa horário ao trocar data
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {dataSelecionada && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Selecione o horário
                  </label>
                  
                  {carregandoHorarios ? (
                    <p className={styles.avisoSelecione}>Carregando horários...</p>
                  ) : horarios.length === 0 ? (
                    <p className={styles.avisoSelecione}>Nenhum horário disponível</p>
                  ) : (
                    <>
                      <div className={styles.horariosGrid}>
                        {horarios.map(h => (
                          <button
                            key={h.hora}
                            type="button"
                            disabled={!h.disponivel}
                            onClick={() => setHorarioSelecionado(h.hora)}
                            className={`
                              ${styles.horarioBtn}
                              ${horarioSelecionado === h.hora ? styles.horarioBtnSelecionado : ''}
                              ${!h.disponivel ? styles.horarioBtnOcupado : ''}
                            `}
                            title={h.disponivel ? 'Disponível' : 'Horário ocupado'}
                          >
                            {h.hora}
                          </button>
                        ))}
                      </div>
                      <p className={styles.horarioInfo}>
                        Horários em cinza já estão ocupados
                      </p>
                    </>
                  )}
                </div>
              )}
            
              <div className={styles.field}>
                <label className={styles.label}>Serviços</label>
                <div className={styles.servicoGrid}>
                  {todosServicos.map(s => (
                    <label 
                      key={s.id} 
                      className={`${styles.servicoCheckbox} ${servicosSelecionados.includes(s.id) ? styles.servicoCheckboxAtivo : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={servicosSelecionados.includes(s.id)}
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
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
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