import { useState, useEffect } from 'react'
import Layout from '@/components/Layout/Layout'
import Button from '@/components/Button/Button'
import { listarServicos, criarServico, atualizarServico, deletarServico } from '@/api/servicos'
import { Pencil, Trash2, Plus } from 'lucide-react'
import styles from './Servicos.module.css'

const vazio = { nome: '', descricao: '', duracaoMinutos: '', preco: '' }

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(vazio)
  const [editandoId, setEditandoId] = useState(null)


  async function carregarServicos() {
    try {
      const { data } = await listarServicos()
      setServicos(data)
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  useEffect(() => {
    carregarServicos()
  }, [])

  useEffect(() => {
    listarServicos().then(r => setServicos(r.data))
  }, [])

  const set = campo => e => setForm({ ...form, [campo]: e.target.value })

  function abrirNovo() { setForm(vazio); setEditandoId(null); setModal(true) }

  function abrirEditar(s) {
    setForm({ nome: s.nome, descricao: s.descricao || '', duracaoMinutos: s.duracaoMinutos, preco: s.preco })
    setEditandoId(s.id)
    setModal(true)
  }

  async function handleSalvar(e) {
  e.preventDefault()
  const payload = { ...form, duracaoMinutos: Number(form.duracaoMinutos), preco: Number(form.preco) }
    try {
      if (editandoId) {
        const { data } = await atualizarServico(editandoId, payload)
        setServicos(prev => prev.map(s => s.id === editandoId ? data : s))
      } else {
        const { data } = await criarServico(payload)
        setServicos(prev => [...prev, data])
      }
      setModal(false)
    } catch (err) {
      console.error('Erro:', err)
    }
  }

async function handleDeletar(id) {
  if (!confirm('Remover serviço?')) return
  try {
    await deletarServico(id)
    setServicos(prev => prev.filter(s => s.id !== id))
  } catch (err) {
    console.error('Erro:', err)
  }
}

  async function handleDeletar(id) {
    if (!confirm('Remover serviço?')) return
    await deletarServico(id)
    setServicos(prev => prev.filter(s => s.id !== id))
  }

  return (
    <Layout>
      <div className={styles.header}>
        <h1 className={styles.title}>Serviços</h1>
        <Button onClick={abrirNovo}><Plus size={15} /> Novo serviço</Button>
      </div>

      <div className={styles.grid}>
        {servicos.map(s => (
          <div key={s.id} className={styles.card}>
            <div>
              <p className={styles.nome}>{s.nome}</p>
              <p className={styles.desc}>{s.descricao}</p>
              <p className={styles.info}>
                {s.duracaoMinutos} min ·{' '}
                <span className={styles.preco}>R$ {Number(s.preco).toFixed(2)}</span>
              </p>
            </div>
            <div className={styles.acoes}>
              <Button variant="ghost" size="sm" onClick={() => abrirEditar(s)}>
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeletar(s.id)}
                style={{ color: 'var(--red)' }}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p className={styles.modalTitle}>{editandoId ? 'Editar serviço' : 'Novo serviço'}</p>
            <form className={styles.form} onSubmit={handleSalvar}>
              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input className={styles.input} value={form.nome} onChange={set('nome')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Descrição</label>
                <input className={styles.input} value={form.descricao} onChange={set('descricao')} />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Duração (min)</label>
                  <input className={styles.input} type="number" value={form.duracaoMinutos}
                    onChange={set('duracaoMinutos')} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Preço (R$)</label>
                  <input className={styles.input} type="number" step="0.01" value={form.preco}
                    onChange={set('preco')} required />
                </div>
              </div>
              <div className={styles.modalAcoes}>
                <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}