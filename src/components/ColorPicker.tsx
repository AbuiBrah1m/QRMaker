interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/** A labelled native color swatch paired with an editable hex field. */
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3 py-2">
      <input
        type="color"
        value={ value }
        onChange={ (e) => onChange(e.target.value) }
        className="no-drag h-9 w-9 rounded-lg"
        aria-label={ `${label} color` }
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] uppercase tracking-wide text-muted">
          {label}
        </p>
        <input
          value={ value }
          onChange={ (e) => onChange(e.target.value) }
          spellCheck={ false }
          className="no-drag w-full bg-transparent text-sm font-semibold uppercase text-foreground outline-none"
        />
      </div>
    </div>
  )
}
