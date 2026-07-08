import { AnimatePresence, motion } from 'framer-motion'
import { type QrConfig } from '../qr/qrEngine'
import { COLOR_PRESETS, SOLID_SWATCHES, RAINBOW_DIRECTIONS } from '../qr/presets'
import { ColorPicker } from './ColorPicker'
import { Segmented } from './Segmented'
import { Toggle } from './Toggle'

interface ColorModePanelProps {
  cfg: QrConfig
  onChange: (patch: Partial<QrConfig>) => void
}

const MODE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'two', label: 'Two-color' },
  { value: 'rainbow', label: 'Rainbow' },
]

const RAINBOW_CSS =
  'linear-gradient(90deg,#ff004d,#ff7a00,#ffd400,#37d67a,#00c2ff,#4b5bff,#b14bff)'

function Swatch({
  color,
  active,
  onClick,
}: {
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={ onClick }
      aria-label={ `Use ${color}` }
      style={ { background: color } }
      className={ `no-drag h-7 w-7 rounded-lg border transition-transform hover:scale-110 ${
        active ? 'border-accent ring-2 ring-accent/40' : 'border-border'
      }` }
    />
  )
}

export function ColorModePanel({ cfg, onChange }: ColorModePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <Segmented
        idKey="mode"
        options={ MODE_OPTIONS }
        value={ cfg.colorMode }
        onChange={ (v) => onChange({ colorMode: v as QrConfig['colorMode'] }) }
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={ cfg.colorMode }
          initial={ { opacity: 0, y: 8 } }
          animate={ { opacity: 1, y: 0 } }
          exit={ { opacity: 0, y: -8 } }
          transition={ { duration: 0.2 } }
          className="flex flex-col gap-4"
        >
          {cfg.colorMode === 'solid' && (
            <>
              <ColorPicker
                label="Foreground"
                value={ cfg.foreground }
                onChange={ (v) => onChange({ foreground: v }) }
              />
              <div className="flex flex-wrap gap-2">
                {SOLID_SWATCHES.map((c) => (
                  <Swatch
                    key={ c }
                    color={ c }
                    active={ cfg.foreground.toLowerCase() === c.toLowerCase() }
                    onClick={ () => onChange({ foreground: c }) }
                  />
                ))}
              </div>
              <ColorPicker
                label="Background"
                value={ cfg.background }
                onChange={ (v) => onChange({ background: v }) }
              />
            </>
          )}

          {cfg.colorMode === 'two' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker
                  label="Primary"
                  value={ cfg.primary }
                  onChange={ (v) => onChange({ primary: v }) }
                />
                <ColorPicker
                  label="Secondary"
                  value={ cfg.secondary }
                  onChange={ (v) => onChange({ secondary: v }) }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={ preset.name }
                    type="button"
                    onClick={ () =>
                      onChange({
                        primary: preset.primary,
                        secondary: preset.secondary,
                      })
                    }
                    className="no-drag group flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 px-2 py-1 text-xs hover:border-accent/50"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={ { background: preset.primary } }
                    />
                    <span
                      className="h-3 w-3 rounded-full"
                      style={ { background: preset.secondary } }
                    />
                    <span className="text-muted group-hover:text-foreground">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
              <Toggle
                checked={ cfg.twoColorGradient }
                onChange={ (v) => onChange({ twoColorGradient: v }) }
                label="Blend as gradient"
                hint="Fade between both colors instead of eyes vs. data."
              />
            </>
          )}

          {cfg.colorMode === 'rainbow' && (
            <>
              <p className="text-xs font-medium text-muted">Spectrum direction</p>
              <Segmented
                idKey="rainbow"
                options={ RAINBOW_DIRECTIONS }
                value={ cfg.rainbowDirection }
                onChange={ (v) =>
                  onChange({ rainbowDirection: v as QrConfig['rainbowDirection'] })
                }
              />
              <div
                className="h-3 w-full rounded-full"
                style={ { background: RAINBOW_CSS } }
              />
              <p className="text-xs text-muted">
                The full color spectrum is mapped across the code.
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
