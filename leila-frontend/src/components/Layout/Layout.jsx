import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Scissors, LogOut } from 'lucide-react'
import Button from '@/components/Button/Button'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const isCliente = usuario?.role === 'CLIENTE'

  function handleSair() {
    sair()
    navigate('/login')
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Scissors size={20} className={styles.brandIcon} />
            Cabeleleila Leila
          </div>
          <nav className={styles.nav}>
            {isCliente ? (
              <>
                <NavLink to="/agendar"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Novo agendamento
                </NavLink>
                <NavLink to="/meus-agendamentos"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Meus agendamentos
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/agendamentos"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Agendamentos
                </NavLink>
                <NavLink to="/servicos"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Serviços
                </NavLink>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleSair}>
              <LogOut size={15} /> Sair
            </Button>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}