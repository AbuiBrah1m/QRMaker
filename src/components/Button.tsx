import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

/** Gradient / ghost button with spring hover + press micro-interactions. */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'no-drag inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50'
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-glow'
      : 'border border-border bg-surface-2/60 text-foreground hover:bg-surface-2'
  return (
    <motion.button
      whileHover={ { scale: 1.035 } }
      whileTap={ { scale: 0.96 } }
      transition={ { type: 'spring', stiffness: 400, damping: 22 } }
      className={ `${base} ${styles} ${className}` }
      { ...rest }
    >
      {children}
    </motion.button>
  )
}
