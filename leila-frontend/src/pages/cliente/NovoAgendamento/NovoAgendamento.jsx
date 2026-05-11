import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout/Layout'
import Button from '@/components/Button/Button'
import { listarServicos } from '@/api/servicos'
import { criarAgendamento } from '@/api/agendamentos'
import { CheckCircle2 } from 'lucide-react'
import styles from './NovoAgendamento.module.css'

export default function NovoAgendamento() {
  const navigate = useNavigate()
  const [servicos, setServicos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [dataHora, setDataHora] = useState('')
  const [observacao, setObservacao] = useState('')
  const [sugestao, setSugestao] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listarServicos().then(r => setServicos(r.data))
  }, [])

  function toggleServico(id) {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }


  async function carregarServicos() {
    try {
      const { data } = await listarServicos()
      setServicos(data)
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    }
  } 

  useEffect(() => {
    carregarServicos()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (selecionados.length === 0) return setErro('Selecione ao menos um serviço')
    setErro('')
    setLoading(true)
    try {
      const { data } = await criarAgendamento({
        dataHora: new Date(dataHora).toISOString().slice(0, 19),
        servicoIds: selecionados,
        observacao,
      })
      if (data.sugestao) setSugestao(data.sugestao)
      else navigate('/meus-agendamentos')
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  if (sugestao) {
    return (
      <Layout>
        <div className={styles.sugestaoCard}>
          <p className={styles.sugestaoTitle}>Sugestão do sistema</p>
          <p className={styles.sugestaoTexto}>{sugestao}</p>
          <div className={styles.sugestaoAcoes}>
            <Button onClick={() => navigate('/meus-agendamentos')}>Ver agendamentos</Button>
            <Button variant="outline" onClick={() => setSugestao('')}>Manter data atual</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.page}>
        <h1 className={styles.title}>Novo agendamento</h1>
        <form onSubmit={handleSubmit}>
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
            <p className={styles.cardHeader}>Data e horário</p>
            <div className={styles.cardBody}>
              <div className={styles.field}>
                <label className={styles.label}>Data e hora</label>
                <input className={styles.input} type="datetime-local"
                  value={dataHora} onChange={e => setDataHora(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Observação (opcional)</label>
                <input className={styles.input} value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Ex: cabelo longo, alergia..." />
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