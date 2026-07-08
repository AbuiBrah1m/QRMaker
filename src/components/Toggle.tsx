import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  hint?: string
}

export function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <label className="no-drag flex cursor-pointer items-center justify-between gap-3">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={ checked }
        onClick={ () => onChange(!checked) }
        className={ `relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked
            ? 'bg-gradient-to-r from-accent to-accent-2'
            : 'border border-border bg-surface-2'
        }` }
      >
        <motion.span
          layout
          transition={ { type: 'spring', stiffness: 500, damping: 30 } }
          className={ `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
            checked ? 'right-0.5' : 'left-0.5'
          }` }
        />
      </button>
    </label>
  )
}
