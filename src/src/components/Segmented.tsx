import { motion } from 'framer-motion'
import { useId } from 'react'

interface Option {
  value: string
  label: string
}

interface SegmentedProps {
  options: readonly Option[]
  value: string
  onChange: (value: string) => void
  idKey?: string
}

/**
 * A segmented control whose active pill smoothly slides between options using
 * Framer Motion's shared layout animation.
 */
export function Segmented({ options, value, onChange, idKey }: SegmentedProps) {
  const auto = useId()
  const layoutId = `seg-${idKey ?? auto}`
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2/50 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={ option.value }
            type="button"
            onClick={ () => onChange(option.value) }
            className={ `no-drag relative min-w-[64px] flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              active ? 'text-white' : 'text-muted hover:text-foreground'
            }` }
          >
            {active && (
              <motion.span
                layoutId={ layoutId }
                transition={ { type: 'spring', stiffness: 400, damping: 30 } }
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-glow"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
