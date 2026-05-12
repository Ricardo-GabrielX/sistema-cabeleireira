import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import StatusBadge from '@/components/StatusBadge/StatusBadge'
import Button from '@/components/Button/Button'
import Modal from '@/components/Modal/Modal'
import { listarTodos, alterarStatus, atualizarAgendamentoCabeleireira, horariosDisponiveis } from '@/api/agendamentos'
import { listarServicos } from '@/api/servicos'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, CalendarDays, Clock, AlertCircle } from 'lucide-react'
import styles from './Agendamentos.module.css'

const hoje = new Date().toISOString().split('T')[0]

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [inicio, setInicio] = useState(hoje)
  const [fim, setFim] = useState(hoje)
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarios, setHorarios] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [observacao, setObservacao] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [todosServicos, setTodosServicos] = useState([])

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

  async function carregarServicos() {
    try {
      const { data } = await listarServicos()
      setTodosServicos(data)
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    }
  }

  useEffect(() => {
    buscar()
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

  function abrirModal(agendamento) {
    setEditando(agendamento)

    const dataHoraObj = parseISO(agendamento.dataHora)
    setDataSelecionada(format(dataHoraObj, 'yyyy-MM-dd'))
    setHorarioSelecionado(format(dataHoraObj, 'HH:mm'))

    setServicosSelecionados(agendamento.servicos.map(s => s.id))
    setObservacao(agendamento.observacao || '')
    setStatusSelecionado(agendamento.status)
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

      await atualizarAgendamentoCabeleireira(editando.id, payload)
      if (statusSelecionado !== editando.status) {
        await alterarStatus(editando.id, statusSelecionado)
      }

      await buscar()
      setModalAberto(false)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao atualizar agendamento')
    } finally {
      setSalvando(false)
    }
  }

  async function handleStatusRapido(id, status) {
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
            <div className={styles.cardActions}>
              <StatusBadge status={a.status} />
              <button
                className={styles.btnEditar}
                onClick={() => abrirModal(a)}
                title="Editar agendamento"
              >
                <Pencil size={16} />
              </button>
            </div>
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
              <Button size="sm" variant="success" onClick={() => handleStatusRapido(a.id, 'CONFIRMADO')}>
                Confirmar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleStatusRapido(a.id, 'CANCELADO')}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      ))}

      <Modal
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo="Editar agendamento"
      >
        <div className={styles.aviso}>
          <AlertCircle size={16} />
          <span>
            Como cabeleireira, você pode alterar qualquer informação deste agendamento.
          </span>
        </div>

        <form className={styles.form} onSubmit={handleSalvar}>
          <div className={styles.field}>
            <label className={styles.label}>
              <CalendarDays
                size={14}
                style={{
                  marginRight: 4,
                  verticalAlign: 'middle'
                }}
              />
              Selecione o dia
            </label>

            <input
              className={styles.input}
              type="date"
              value={dataSelecionada}
              onChange={e => {
                setDataSelecionada(e.target.value)
                setHorarioSelecionado('')
              }}
              required
            />
          </div>

          {dataSelecionada && (
            <div className={styles.field}>
              <label className={styles.label}>
                <Clock
                  size={14}
                  style={{
                    marginRight: 4,
                    verticalAlign: 'middle'
                  }}
                />
                Selecione o horário
              </label>

              {carregandoHorarios ? (
                <p className={styles.avisoSelecione}>
                  Carregando horários...
                </p>
              ) : horarios.length === 0 ? (
                <p className={styles.avisoSelecione}>
                  Nenhum horário disponível
                </p>
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
                          ${horarioSelecionado === h.hora
                            ? styles.horarioBtnSelecionado
                            : ''
                          }
                          ${!h.disponivel
                            ? styles.horarioBtnOcupado
                            : ''
                          }
                        `}
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
            <label className={styles.label}>
              Serviços
            </label>

            <div className={styles.servicoGrid}>
              {todosServicos.map(s => (
                <label
                  key={s.id}
                  className={`
                    ${styles.servicoCheckbox}
                    ${servicosSelecionados.includes(s.id)
                      ? styles.servicoCheckboxAtivo
                      : ''
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={servicosSelecionados.includes(s.id)}
                    onChange={() => toggleServico(s.id)}
                  />

                  <span className={styles.servicoLabel}>
                    {s.nome}

                    <br />

                    <small>
                      R$ {Number(s.preco).toFixed(2)}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Status do agendamento
            </label>

            <select
              className={styles.input}
              value={statusSelecionado}
              onChange={e => setStatusSelecionado(e.target.value)}
            >
              <option value="PENDENTE">
                Pendente
              </option>

              <option value="CONFIRMADO">
                Confirmado
              </option>

              <option value="CANCELADO">
                Cancelado
              </option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Observação
            </label>

            <input
              className={styles.input}
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Ex: cabelo longo..."
            />
          </div>

          {erro && (
            <div className={styles.erro}>
              {erro}
            </div>
          )}

          <div className={styles.modalAcoes}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAberto(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : 'Salvar alterações'
              }
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}