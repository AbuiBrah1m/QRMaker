import { type QrConfig } from '../qr/qrEngine'
import { type ExportFormat } from '../qr/useQrCode'
import { Button } from './Button'
import { Toggle } from './Toggle'

interface ExportPanelProps {
  cfg: QrConfig
  onChange: (patch: Partial<QrConfig>) => void
  onExport: (format: ExportFormat) => void
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'png', label: 'PNG' },
  { id: 'svg', label: 'SVG' },
  { id: 'jpeg', label: 'JPG' },
]

/** Resolution + transparency controls and the three export buttons. */
export function ExportPanel({ cfg, onChange, onExport }: ExportPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Resolution</span>
          <span className="text-xs font-semibold text-accent">{cfg.size} px</span>
        </div>
        <input
          type="range"
          min={ 512 }
          max={ 2048 }
          step={ 128 }
          value={ cfg.size }
          onChange={ (e) => onChange({ size: Number(e.target.value) }) }
          className="no-drag mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>512</span>
          <span>2048</span>
        </div>
      </div>

      <Toggle
        checked={ cfg.transparentBg }
        onChange={ (v) => onChange({ transparentBg: v }) }
        label="Transparent background"
        hint="Applies to PNG and SVG (JPG stays opaque)."
      />

      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map((format) => (
          <Button key={ format.id } onClick={ () => onExport(format.id) }>
            {format.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
