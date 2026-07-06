import { type QrConfig } from '../qr/qrEngine'
import { MODULE_SHAPES, EYE_SHAPES } from '../qr/presets'
import { Segmented } from './Segmented'

interface ShapePanelProps {
  cfg: QrConfig
  onChange: (patch: Partial<QrConfig>) => void
}

/** Module-shape and eye-style selectors. */
export function ShapePanel({ cfg, onChange }: ShapePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Module shape</p>
        <Segmented
          idKey="module"
          options={ MODULE_SHAPES }
          value={ cfg.moduleShape }
          onChange={ (v) => onChange({ moduleShape: v as QrConfig['moduleShape'] }) }
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Eye style</p>
        <Segmented
          idKey="eye"
          options={ EYE_SHAPES }
          value={ cfg.eyeShape }
          onChange={ (v) => onChange({ eyeShape: v as QrConfig['eyeShape'] }) }
        />
      </div>
    </div>
  )
}
