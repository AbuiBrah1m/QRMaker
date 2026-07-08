import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  delay?: number
}

export function Card({ title, children, className = '', delay = 0 }: CardProps) {
  return (
    <motion.section
      initial={ { opacity: 0, y: 18 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { type: 'spring', stiffness: 260, damping: 26, delay } }
      className={ `glass rounded-xl2 p-5 shadow-card ${className}` }
    >
      {title && (
        <header className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            {title}
          </h2>
        </header>
      )}
      {children}
    </motion.section>
  )
}
