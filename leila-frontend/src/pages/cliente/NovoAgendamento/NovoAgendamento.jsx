import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout/Layout'
import Button from '@/components/Button/Button'
import { listarServicos } from '@/api/servicos'
import { criarAgendamento, horariosDisponiveis } from '@/api/agendamentos'
import { CheckCircle2, CalendarDays, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './NovoAgendamento.module.css'

export default function NovoAgendamento() {
  const navigate = useNavigate()
  const [servicos, setServicos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarios, setHorarios] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  
  const [observacao, setObservacao] = useState('')
  const [sugestao, setSugestao] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listarServicos().then(r => setServicos(r.data))
  }, [])

  useEffect(() => {
    if (!dataSelecionada) {
      setHorarios([])
      setHorarioSelecionado('')
      return
    }

    setCarregandoHorarios(true)
    setHorarioSelecionado('')
    
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
        setHorarios(parsed)
      })
      .catch(err => {
        console.error('Erro ao buscar horários:', err)
        setErro('Erro ao carregar horários disponíveis')
      })
      .finally(() => setCarregandoHorarios(false))
  }, [dataSelecionada])

  function toggleServico(id) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (selecionados.length === 0) {
      setErro('Selecione ao menos um serviço')
      return
    }
    
    if (!dataSelecionada || !horarioSelecionado) {
      setErro('Selecione uma data e um horário')
      return
    }
    
    setErro('')
    setLoading(true)
    
    try {
      const dataHoraCompleta = `${dataSelecionada}T${horarioSelecionado}:00`
      
      const { data } = await criarAgendamento({
        dataHora: dataHoraCompleta,
        servicoIds: selecionados,
        observacao,
      })
      
      if (data.sugestao) {
        setSugestao(data.sugestao)
      } else {
        navigate('/meus-agendamentos')
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  if (sugestao) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.sugestaoCard}>
            <p className={styles.sugestaoTitle}>⚠️ Você já tem outro agendamento nesta semana</p>
            <p className={styles.sugestaoTexto}>{sugestao}</p>
            
            <div className={styles.sugestaoAcoes}>
              <Button onClick={() => {
                setSugestao('')
                setDataSelecionada('')
                setHorarioSelecionado('')
              }}>
                Escolher outra data
              </Button>
              <Button variant="outline" onClick={() => navigate('/meus-agendamentos')}>
                Ver meus agendamentos
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

const dataHoraResumo = dataSelecionada && horarioSelecionado
  ? `${format(new Date(dataSelecionada + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às ${horarioSelecionado}`
  : null

  return (
    <Layout>
      <div className={styles.page}>
        <h1 className={styles.title}>Novo agendamento</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Serviços */}
          <div className={styles.card}>
            <p className={styles.cardHeader}>Escolha os serviços</p>
            <div className={styles.cardBody}>
              <div className={styles.grid}>
                {servicos.map(s => (
                  <button
                    key={s.id} type="button"
                    onClick={() => toggleServico(s.id)}
                    className={`${styles.servicoBtn} ${selecionados.includes(s.id) ? styles.servicoBtnAtivo : ''}`}
                  >
                    <div className={styles.servicoNome}>
                      {s.nome}
                      {selecionados.includes(s.id) && <CheckCircle2 size={15} color="var(--pink)" />}
                    </div>
                    <p className={styles.servicoInfo}>{s.duracaoMinutos} min · R$ {Number(s.preco).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardHeader}>Escolha a data e horário</p>
            <div className={styles.cardBody}>
              <div className={styles.calendario}>
                {/* Seleção de data */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    <CalendarDays size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Selecione o dia
                  </label>
                  <input
                    className={styles.inputData}
                    type="date"
                    value={dataSelecionada}
                    onChange={e => setDataSelecionada(e.target.value)}
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
                      <p className={styles.avisoSelecione}>Nenhum horário disponível para este dia</p>
                    ) : (
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
                    )}
                    
                    {horarios.length > 0 && (
                      <p className={styles.horarioInfo}>
                        Horários em cinza já estão ocupados
                      </p>
                    )}
                  </div>
                )}

                {!dataSelecionada && (
                  <p className={styles.avisoSelecione}>
                    Selecione primeiro uma data para ver os horários disponíveis
                  </p>
                )}
              </div>
            </div>
          </div>

          {dataHoraResumo && (
            <div className={styles.resumoHorario}>
              📅 {dataHoraResumo}
            </div>
          )}

          <div className={styles.card}>
            <p className={styles.cardHeader}>Observações</p>
            <div className={styles.cardBody}>
              <div className={styles.field}>
                <label className={styles.label}>Observação (opcional)</label>
                <input
                  className={styles.input}
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Ex: cabelo longo, alergia a amônia..."
                />
              </div>
            </div>
          </div>
          
          {selecionados.length > 0 && (
            <div className={styles.selecionados}>
              {servicos.filter(s => selecionados.includes(s.id)).map(s => (
                <span key={s.id} className={styles.tag}>{s.nome}</span>
              ))}
            </div>
          )}

          {erro && <p className={styles.erro}>{erro}</p>}

          <Button type="submit" full disabled={loading}>
            {loading ? 'Agendando...' : 'Confirmar agendamento'}
          </Button>
        </form>
      </div>
    </Layout>
  )
}