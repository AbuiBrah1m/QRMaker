import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { LogoMark } from './LogoMark'

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1900)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      className="app-bg fixed inset-0 z-[80] flex items-center justify-center bg-surface"
      initial={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      transition={ { duration: 0.5, ease: 'easeInOut' } }
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          initial={ { scale: 0.6, opacity: 0, rotate: -12 } }
          animate={ { scale: 1, opacity: 1, rotate: 0 } }
          transition={ { type: 'spring', stiffness: 200, damping: 15 } }
        >
          <LogoMark size={ 96 } />
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={ {
              boxShadow: [
                '0 0 0px rgba(124,92,255,0)',
                '0 0 55px rgba(124,92,255,0.6)',
                '0 0 0px rgba(124,92,255,0)',
              ],
            } }
            transition={ { duration: 2, repeat: Infinity } }
          />
        </motion.div>

        <motion.div
          className="text-center"
          initial={ { opacity: 0, y: 10 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { delay: 0.3 } }
        >
          <h1 className="text-gradient text-2xl font-bold tracking-tight">
            QR Studio
          </h1>
          <p className="mt-1 text-sm text-muted">Crafting your canvas…</p>
        </motion.div>

        <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
            initial={ { width: '0%' } }
            animate={ { width: '100%' } }
            transition={ { duration: 1.7, ease: 'easeInOut' } }
          />
        </div>
      </div>
    </motion.div>
  )
}
