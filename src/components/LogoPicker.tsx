import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Button'
import { Segmented } from './Segmented'
import { LOGO_SHAPES } from '../qr/presets'
import type { LogoShape } from '../qr/qrEngine'

interface LogoPickerProps {
  logo: string | null
  logoSize: number
  logoShape: LogoShape
  onPick: () => void
  onRemove: () => void
  onSize: (value: number) => void
  onShape: (value: LogoShape) => void
}

const SHAPE_THUMB_CLASS: Record<LogoShape, string> = {
  square: 'rounded-md',
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
}

export function LogoPicker({
  logo,
  logoSize,
  logoShape,
  onPick,
  onRemove,
  onSize,
  onShape,
}: LogoPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className={ `relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-white ${SHAPE_THUMB_CLASS[logoShape]}` }
        >
          <AnimatePresence mode="wait">
            {logo ? (
              <motion.img
                key="logo"
                src={ logo }
                alt="Selected logo"
                initial={ { opacity: 0, scale: 0.6 } }
                animate={ { opacity: 1, scale: 1 } }
                exit={ { opacity: 0, scale: 0.6 } }
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <motion.span
                key="empty"
                initial={ { opacity: 0 } }
                animate={ { opacity: 1 } }
                exit={ { opacity: 0 } }
                className="text-2xl font-light text-muted"
              >
                +
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <Button variant="ghost" onClick={ onPick }>
            {logo ? 'Replace image' : 'Choose image…'}
          </Button>
          {logo && (
            <button
              type="button"
              onClick={ onRemove }
              className="no-drag text-xs text-red-400 hover:underline"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={ false }>
        {logo && (
          <motion.div
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            exit={ { opacity: 0, height: 0 } }
            className="overflow-hidden"
          >
            {/* Logo shape selector */}
            <div className="mb-4">
              <span className="mb-2 block text-xs font-medium text-muted">
                Logo shape
              </span>
              <Segmented
                idKey="logo-shape"
                options={ LOGO_SHAPES }
                value={ logoShape }
                onChange={ (v) => onShape(v as LogoShape) }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Logo size</span>
              <span className="text-xs font-semibold text-accent">
                {Math.round(logoSize * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={ 0.15 }
              max={ 0.4 }
              step={ 0.01 }
              value={ logoSize }
              onChange={ (e) => onSize(Number(e.target.value)) }
              className="no-drag mt-2 w-full"
            />
            <p className="mt-2 text-xs text-muted">
              Error correction is boosted to level H automatically so the code
              stays scannable behind the logo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
