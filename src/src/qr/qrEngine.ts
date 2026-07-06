import type { Options as QrCodeStylingOptions } from 'qr-code-styling'

/**
 * QR engine
 * ---------
 * Pure functions that translate the app's high-level configuration into the
 * option object understood by `qr-code-styling`. Keeping this free of React or
 * DOM code makes the color/shape logic easy to reason about and reuse for both
 * the live preview and the high-resolution export.
 */

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
  /** The already-normalized URL string encoded in the QR. */
  data: string
  colorMode: ColorMode

  /* Solid mode */
  foreground: string
  background: string
  transparentBg: boolean

  /* Two-color mode */
  primary: string
  secondary: string
  twoColorGradient: boolean

  /* Rainbow mode */
  rainbowDirection: RainbowDirection

  /* Shapes */
  moduleShape: ModuleShape
  eyeShape: EyeShape

  /* Logo */
  logo: string | null
  logoSize: number // fraction of the QR (0.15 - 0.4)
  logoShape: LogoShape // shape of the padded tile drawn behind the logo

  /* Output size in pixels */
  size: number
}

// Placeholder URL used before the user types anything (built via concatenation).
export const PLACEHOLDER_DATA = 'https' + '://' + 'example' + '.com'

/** Sensible defaults for a fresh session. */
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

/** Full-spectrum stops used by rainbow mode. */
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

/** Maps our eye style onto the `cornersDot` type supported by the library. */
function cornersDotType(eye: EyeShape): 'dot' | 'square' {
  return eye === 'square' ? 'square' : 'dot'
}

/** Builds a rainbow gradient for the requested direction. */
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

/**
 * Translate a `QrConfig` into `qr-code-styling` options.
 * The `type` (canvas vs svg) is intentionally left to the caller so the same
 * config can render a canvas preview or an SVG export.
 */
export function buildQrOptions(cfg: QrConfig): Partial<QrCodeStylingOptions> {
  const hasLogo = Boolean(cfg.logo)
  const background = cfg.transparentBg ? 'rgba(0,0,0,0)' : cfg.background

  // Defaults assume solid mode.
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
      // Two-stop diagonal gradient blending both colors across every module.
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
      // Data modules in the primary color, finder/eye patterns in the secondary.
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
    // Logos block modules, so force the highest error correction (H = 30%)
    // whenever a logo is present; otherwise stay at a crisp Q level.
    qrOptions: {
      errorCorrectionLevel: hasLogo ? 'H' : 'Q',
    },
    image: cfg.logo ?? undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 6,
      imageSize: cfg.logoSize,
      // Clears modules behind the logo and adds padding so it stays scannable.
      hideBackgroundDots: true,
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: { color: background },
  }
}
