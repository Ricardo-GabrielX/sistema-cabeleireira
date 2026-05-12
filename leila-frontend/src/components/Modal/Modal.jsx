import styles from './Modal.module.css'

export default function Modal({
  aberto,
  onClose,
  titulo,
  children,
  maxWidth = '500px'
}) {
  if (!aberto) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {titulo && (
          <h2 className={styles.title}>
            {titulo}
          </h2>
        )}

        {children}
      </div>
    </div>
  )
}