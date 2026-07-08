import type {
  ModuleShape,
  EyeShape,
  RainbowDirection,
  LogoShape,
} from './qrEngine'

export interface ColorPreset {
  name: string
  primary: string
  secondary: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Midnight', primary: '#111827', secondary: '#6366f1' },
  { name: 'Crimson', primary: '#0a0a0a', secondary: '#ef4444' },
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#1e3a8a' },
  { name: 'Sunset', primary: '#f97316', secondary: '#db2777' },
  { name: 'Forest', primary: '#065f46', secondary: '#84cc16' },
  { name: 'Grape', primary: '#7c3aed', secondary: '#22d3ee' },
  { name: 'Gold', primary: '#78350f', secondary: '#f59e0b' },
  { name: 'Mono', primary: '#000000', secondary: '#000000' },
]

export const SOLID_SWATCHES: string[] = [
  '#000000',
  '#1f2937',
  '#7c3aed',
  '#2563eb',
  '#0ea5e9',
  '#059669',
  '#dc2626',
  '#db2777',
]

export const MODULE_SHAPES: { value: ModuleShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'extra-rounded', label: 'Extra' },
]

export const EYE_SHAPES: { value: EyeShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Rounded' },
]

export const RAINBOW_DIRECTIONS: { value: RainbowDirection; label: string }[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'radial', label: 'Radial' },
]

export const LOGO_SHAPES: { value: LogoShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
]
