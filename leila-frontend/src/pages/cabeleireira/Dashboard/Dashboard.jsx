import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import { dashboardSemana } from '@/api/agendamentos'
import Button from '@/components/Button/Button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CalendarCheck, Clock, XCircle, Users } from 'lucide-react'
import styles from './Dashboard.module.css'

const resumoConfig = [
  { key: 'totalSemana',  label: 'Total',       color: '#3b82f6', Icon: CalendarCheck },
  { key: 'confirmados',  label: 'Confirmados', color: 'var(--green)', Icon: CalendarCheck },
  { key: 'pendentes',    label: 'Pendentes',   color: 'var(--yellow)', Icon: Clock },
  { key: 'cancelados',   label: 'Cancelados',  color: 'var(--red)', Icon: XCircle },
]

export default function Dashboard() {
  const [dados, setDados] = useState(null)

  async function carregarDados() {
  try {
    const { data } = await dashboardSemana()
    setDados(data)
  } catch (err) {
    console.error('Erro:', err)
  }
}


useEffect(() => {
  carregarDados()
}, [])


  useEffect(() => {
    dashboardSemana().then(r => setDados(r.data))
  }, [])

  if (!dados) return <Layout><p>Carregando...</p></Layout>

  const graficoData = Object.entries(dados.agendamentosPorDia)
    .map(([dia, total]) => ({ dia, total }))

  return (
    <Layout>
      <h1 className={styles.title}>Dashboard da semana</h1>

      <Button onClick={carregarDados}>🔄 Atualizar</Button>

      <div className={styles.cards}>
        {resumoConfig.map(({ key, label, color, Icon }) => (
          <div key={key} className={styles.card}>
            <div className={styles.cardInner}>
              <Icon size={26} color={color} />
              <div>
                <p className={styles.cardNum}>{dados[key]}</p>
                <p className={styles.cardLabel}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grafico}>
        <p className={styles.graficoTitle}>Agendamentos por dia</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={graficoData}>
            <XAxis dataKey="dia" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="var(--pink)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {dados.sugestoes.length > 0 && (
        <div className={styles.sugestoes}>
          <p className={styles.sugestoesTitle}>
            <Users size={17} color="var(--yellow)" />
            Sugestões de consolidação
          </p>
          {dados.sugestoes.map((s, i) => (
            <div key={i} className={styles.sugestaoItem}>
              <p className={styles.sugestaoNome}>{s.clienteNome}</p>
              <p className={styles.sugestaoTel}>{s.clienteTelefone}</p>
              <p className={styles.sugestaoHint}>
                {s.agendamentos.length} agendamentos esta semana — sugerir agrupar em {s.sugestaoData}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}