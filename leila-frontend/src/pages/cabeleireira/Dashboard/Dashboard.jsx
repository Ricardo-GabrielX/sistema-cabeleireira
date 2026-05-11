import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import StatusBadge from '@/components/StatusBadge/StatusBadge'
import { dashboardSemana } from '@/api/agendamentos'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  CalendarCheck,
  Clock,
  XCircle,
  Users,
  CalendarDays,
  Phone,
} from 'lucide-react'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './Dashboard.module.css'

const resumoConfig = [
  {
    key: 'totalSemana',
    label: 'Total',
    color: '#3b82f6',
    Icon: CalendarCheck,
  },
  {
    key: 'confirmados',
    label: 'Confirmados',
    color: 'var(--green)',
    Icon: CalendarCheck,
  },
  {
    key: 'pendentes',
    label: 'Pendentes',
    color: 'var(--yellow)',
    Icon: Clock,
  },
  {
    key: 'cancelados',
    label: 'Cancelados',
    color: 'var(--red)',
    Icon: XCircle,
  },
]

export default function Dashboard() {
  const [dados, setDados] = useState(null)
  const [agendamentosSemana, setAgendamentosSemana] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  async function carregarDados() {
    try {
      setLoading(true)
      setErro(null)

      const { data } = await dashboardSemana()

      console.log('Dashboard:', data)

      setDados(data)
      setAgendamentosSemana(data.agendamentos || [])

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setErro('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    )
  }

  if (erro) {
    return (
      <Layout>
        <p>{erro}</p>
      </Layout>
    )
  }

  if (!dados) {
    return (
      <Layout>
        <p>Nenhum dado encontrado</p>
      </Layout>
    )
  }

  const diasSemana = [
  'seg.',
  'ter.',
  'qua.',
  'qui.',
  'sex.',
  // 'sáb.',
  // 'dom.',
]

 // Acho que vou manter seg a sex para o dashboard não ficar muito poluído.

  const graficoData = diasSemana.map(dia => ({
    dia,
    total: dados.agendamentosPorDia?.[dia] || 0,
  }))

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 className={styles.title}>Dashboard da semana</h1>

        <button
          onClick={carregarDados}
          style={{
            background: 'var(--pink)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Atualizar
        </button>
      </div>

      <div className={styles.cards}>
        {resumoConfig.map(({ key, label, color, Icon }) => (
          <div key={key} className={styles.card}>
            <div className={styles.cardInner}>
              <Icon size={26} color={color} />

              <div>
                <p className={styles.cardNum}>
                  {dados[key] || 0}
                </p>

                <p className={styles.cardLabel}>
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grafico}>
        <p className={styles.graficoTitle}>
          Agendamentos por dia
        </p>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={graficoData}>
            <XAxis dataKey="dia" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Bar
              dataKey="total"
              fill="var(--pink)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.agendamentosLista}>
        <p className={styles.agendamentosTitle}>
          <CalendarDays
            size={18}
            color="var(--pink)"
          />

          Agendamentos desta semana
        </p>

        {agendamentosSemana.length === 0 ? (
          <div className={styles.vazioAgendamentos}>
            Nenhum agendamento nesta semana
          </div>
        ) : (
          agendamentosSemana.map(a => (
            <div
              key={a.id}
              className={styles.agendamentoItem}
            >
              <div className={styles.agendamentoHeader}>
                <div className={styles.clienteInfo}>
                  <p className={styles.clienteNome}>
                    {a.clienteNome}
                  </p>

                  <p className={styles.clienteTel}>
                    <Phone
                      size={11}
                      style={{
                        verticalAlign: 'middle',
                      }}
                    />

                    {' '}
                    {a.clienteTelefone}
                  </p>
                </div>

                <StatusBadge status={a.status} />
              </div>

              <div className={styles.agendamentoDataHora}>
                <CalendarDays size={13} />

                {format(
                  parseISO(a.dataHora),
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}
              </div>

              <div className={styles.agendamentoServicos}>
                {a.servicos?.map(s => (
                  <span
                    key={s.id}
                    className={styles.servicoTag}
                  >
                    {s.nome}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {dados.sugestoes?.length > 0 && (
        <div className={styles.sugestoes}>
          <p className={styles.sugestoesTitle}>
            <Users
              size={17}
              color="var(--yellow)"
            />

            Sugestões de consolidação
          </p>

          {dados.sugestoes.map((s, i) => (
            <div
              key={i}
              className={styles.sugestaoItem}
            >
              <p className={styles.sugestaoNome}>
                {s.clienteNome}
              </p>

              <p className={styles.sugestaoTel}>
                {s.clienteTelefone}
              </p>

              <p className={styles.sugestaoHint}>
                {s.agendamentos?.length || 0}
                {' '}
                agendamentos esta semana — sugerir
                agrupar em
                {' '}
                {s.sugestaoData}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}