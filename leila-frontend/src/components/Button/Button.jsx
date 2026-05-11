import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size,
  full,
  className = '',
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    full ? styles.full : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}