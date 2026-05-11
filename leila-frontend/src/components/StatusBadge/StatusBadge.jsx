import styles from './StatusBadge.module.css'

const labels = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}