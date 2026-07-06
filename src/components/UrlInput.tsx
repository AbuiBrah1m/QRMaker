import { AnimatePresence, motion } from 'framer-motion'

interface UrlInputProps {
  value: string
  valid: boolean
  touched: boolean
  onChange: (value: string) => void
}

/**
 * Validated URL field. Shows an animated green check when valid and a red
 * shake plus helper text when the input is present but invalid.
 */
export function UrlInput({ value, valid, touched, onChange }: UrlInputProps) {
  const hasText = value.trim().length > 0
  const showInvalid = touched && hasText && !valid
  const showValid = valid

  return (
    <div>
      <motion.div
        animate={ showInvalid ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 } }
        transition={ { duration: 0.4 } }
        className={ `flex items-center gap-2 rounded-xl border bg-surface-2/60 px-3 transition-colors ${
          showInvalid
            ? 'border-red-500/70'
            : showValid
              ? 'border-emerald-500/60'
              : 'border-border focus-within:border-accent/60'
        }` }
      >
        <span className="text-muted" aria-hidden>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          value={ value }
          onChange={ (e) => onChange(e.target.value) }
          placeholder="Paste or type a link to encode"
          spellCheck={ false }
          className="no-drag w-full bg-transparent py-3 text-foreground outline-none placeholder:text-muted"
        />
        <AnimatePresence mode="wait">
          {showValid && (
            <motion.span
              key="ok"
              initial={ { scale: 0, rotate: -35 } }
              animate={ { scale: 1, rotate: 0 } }
              exit={ { scale: 0 } }
              transition={ { type: 'spring', stiffness: 500, damping: 18 } }
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
            >
              ✓
            </motion.span>
          )}
          {showInvalid && (
            <motion.span
              key="bad"
              initial={ { scale: 0 } }
              animate={ { scale: 1 } }
              exit={ { scale: 0 } }
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
            >
              !
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {showInvalid && (
          <motion.p
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            exit={ { opacity: 0, height: 0 } }
            className="mt-2 overflow-hidden pl-1 text-xs text-red-400"
          >
            Please enter a valid link that includes a domain.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
