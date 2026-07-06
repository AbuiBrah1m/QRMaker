import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import { LogoMark } from './LogoMark'

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
      </g>
    </svg>
  )
}

function WindowControl({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void
  label: string
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={ label }
      onClick={ onClick }
      className={ `no-drag flex h-8 w-10 items-center justify-center rounded-lg text-muted transition-colors ${
        danger
          ? 'hover:bg-red-500 hover:text-white'
          : 'hover:bg-surface-2 hover:text-foreground'
      }` }
    >
      {children}
    </button>
  )
}

/** Frameless custom title bar: brand, theme toggle and window controls. */
export function TitleBar() {
  const { theme, toggle } = useTheme()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let active = true
    window.api.isMaximized().then((v) => {
      if (active) setMaximized(v)
    })
    const off = window.api.onMaximizeChange(setMaximized)
    return () => {
      active = false
      off()
    }
  }, [])

  return (
    <header className="drag glass z-30 flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-3">
      <div className="flex items-center gap-2.5">
        <LogoMark size={ 22 } />
        <span className="text-sm font-semibold tracking-tight">QR Studio</span>
      </div>

      <div className="flex items-center gap-1">
        <motion.button
          type="button"
          aria-label="Toggle theme"
          onClick={ toggle }
          whileTap={ { scale: 0.88 } }
          className="no-drag mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <motion.span
            key={ theme }
            initial={ { rotate: -90, opacity: 0 } }
            animate={ { rotate: 0, opacity: 1 } }
            transition={ { type: 'spring', stiffness: 300, damping: 20 } }
            className="flex"
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </motion.span>
        </motion.button>

        <WindowControl onClick={ () => window.api.minimize() } label="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line
              x1="2"
              y1="6"
              x2="10"
              y2="6"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </WindowControl>

        <WindowControl
          onClick={ () => window.api.toggleMaximize() }
          label="Maximize"
        >
          {maximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect
                x="3"
                y="3"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M5 3V2.2A1.2 1.2 0 0 1 6.2 1H9.8A1.2 1.2 0 0 1 11 2.2v3.6A1.2 1.2 0 0 1 9.8 7H9"
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect
                x="2"
                y="2"
                width="8"
                height="8"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          )}
        </WindowControl>

        <WindowControl onClick={ () => window.api.close() } label="Close" danger>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line
              x1="2.5"
              y1="2.5"
              x2="9.5"
              y2="9.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <line
              x1="9.5"
              y1="2.5"
              x2="2.5"
              y2="9.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </WindowControl>
      </div>
    </header>
  )
}
