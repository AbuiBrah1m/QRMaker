import type { Options as QrCodeStylingOptions } from 'qr-code-styling'

export type ColorMode = 'solid' | 'two' | 'rainbow'
export type ModuleShape =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'extra-rounded'
export type EyeShape = 'square' | 'dot' | 'extra-rounded'
export type RainbowDirection = 'horizontal' | 'vertical' | 'radial'
export type LogoShape = 'square' | 'rounded' | 'circle'

export interface QrConfig {
  data: string
  colorMode: ColorMode

  foreground: string
  background: string
  transparentBg: boolean

  primary: string
  secondary: string
  twoColorGradient: boolean

  rainbowDirection: RainbowDirection

  moduleShape: ModuleShape
  eyeShape: EyeShape

  logo: string | null
  logoSize: number
  logoShape: LogoShape

  size: number
}

export const PLACEHOLDER_DATA = 'https' + '://' + 'example' + '.com'

export const DEFAULT_CONFIG: QrConfig = {
  data: '',
  colorMode: 'solid',
  foreground: '#111827',
  background: '#ffffff',
  transparentBg: false,
  primary: '#0a0a0a',
  secondary: '#ef4444',
  twoColorGradient: false,
  rainbowDirection: 'horizontal',
  moduleShape: 'rounded',
  eyeShape: 'extra-rounded',
  logo: null,
  logoSize: 0.25,
  logoShape: 'rounded',
  size: 1024,
}

const RAINBOW_STOPS = [
  '#ff004d',
  '#ff7a00',
  '#ffd400',
  '#37d67a',
  '#00c2ff',
  '#4b5bff',
  '#b14bff',
]

type Gradient = NonNullable<
  NonNullable<QrCodeStylingOptions['dotsOptions']>['gradient']
>

function cornersDotType(eye: EyeShape): 'dot' | 'square' {
  return eye === 'square' ? 'square' : 'dot'
}

function rainbowGradient(direction: RainbowDirection): Gradient {
  const colorStops = RAINBOW_STOPS.map((color, i) => ({
    offset: i / (RAINBOW_STOPS.length - 1),
    color,
  }))
  return {
    type: direction === 'radial' ? 'radial' : 'linear',
    rotation: direction === 'vertical' ? Math.PI / 2 : 0,
    colorStops,
  }
}

export function buildQrOptions(cfg: QrConfig): Partial<QrCodeStylingOptions> {
  const hasLogo = Boolean(cfg.logo)
  const background = cfg.transparentBg ? 'rgba(0,0,0,0)' : cfg.background

  let dotsOptions: QrCodeStylingOptions['dotsOptions'] = {
    type: cfg.moduleShape,
    color: cfg.foreground,
  }
  let cornersSquareOptions: QrCodeStylingOptions['cornersSquareOptions'] = {
    type: cfg.eyeShape,
    color: cfg.foreground,
  }
  let cornersDotOptions: QrCodeStylingOptions['cornersDotOptions'] = {
    type: cornersDotType(cfg.eyeShape),
    color: cfg.foreground,
  }

  if (cfg.colorMode === 'two') {
    if (cfg.twoColorGradient) {
      const grad: Gradient = {
        type: 'linear',
        rotation: Math.PI / 4,
        colorStops: [
          { offset: 0, color: cfg.primary },
          { offset: 1, color: cfg.secondary },
        ],
      }
      dotsOptions = { type: cfg.moduleShape, gradient: grad }
      cornersSquareOptions = { type: cfg.eyeShape, gradient: grad }
      cornersDotOptions = { type: cornersDotType(cfg.eyeShape), gradient: grad }
    } else {
      dotsOptions = { type: cfg.moduleShape, color: cfg.primary }
      cornersSquareOptions = { type: cfg.eyeShape, color: cfg.secondary }
      cornersDotOptions = {
        type: cornersDotType(cfg.eyeShape),
        color: cfg.secondary,
      }
    }
  } else if (cfg.colorMode === 'rainbow') {
    const grad = rainbowGradient(cfg.rainbowDirection)
    dotsOptions = { type: cfg.moduleShape, gradient: grad }
    cornersSquareOptions = { type: cfg.eyeShape, gradient: grad }
    cornersDotOptions = { type: cornersDotType(cfg.eyeShape), gradient: grad }
  }

  return {
    width: cfg.size,
    height: cfg.size,
    data: cfg.data || PLACEHOLDER_DATA,
    margin: Math.round(cfg.size * 0.04),
    qrOptions: {
      errorCorrectionLevel: hasLogo ? 'H' : 'Q',
    },
    image: cfg.logo ?? undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 6,
      imageSize: cfg.logoSize,
      hideBackgroundDots: true,
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: { color: background },
  }
}
