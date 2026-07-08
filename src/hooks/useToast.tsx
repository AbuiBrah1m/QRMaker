import { AnimatePresence, motion } from 'framer-motion'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(
  () => undefined,
)

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const ACCENTS: Record<ToastType, string> = {
  success: 'from-emerald-400 to-green-500',
  error: 'from-rose-500 to-red-500',
  info: 'from-sky-400 to-blue-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3400)
  }, [])

  return (
    <ToastContext.Provider value={ push }>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={ t.id }
              layout
              initial={ { opacity: 0, x: 60, scale: 0.85 } }
              animate={ { opacity: 1, x: 0, scale: 1 } }
              exit={ { opacity: 0, x: 60, scale: 0.85 } }
              transition={ { type: 'spring', stiffness: 400, damping: 30 } }
              className="glass pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${ACCENTS[t.type]} text-sm font-bold text-white`}
              >
                { ICONS[t.type] }
              </span>
              <span className="text-sm font-medium text-foreground">
                { t.message }
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
