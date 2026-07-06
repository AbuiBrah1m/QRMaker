import type { LogoShape } from '../qr/qrEngine'

/** Traces a rounded-rectangle path (radius is clamped to half the size). */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Redraws an uploaded logo onto a padded white tile clipped to the requested
 * shape (square / rounded / circle) so it stays crisp and scannable when
 * embedded at the center of a QR. `qr-code-styling` only *places* the image, so
 * all shaping/padding is done here. Returns a PNG data URL; falls back to the
 * original source on any failure.
 */
export function processLogo(src: string, shape: LogoShape): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const size = 480
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(src)
          return
        }

        const radius =
          shape === 'circle'
            ? size / 2
            : shape === 'rounded'
              ? size * 0.22
              : size * 0.06

        // Padded white background tile in the chosen shape.
        ctx.fillStyle = '#ffffff'
        roundedRectPath(ctx, 0, 0, size, size, radius)
        ctx.fill()

        // Clip to the shape, then draw the image "contained" with padding.
        ctx.save()
        roundedRectPath(ctx, 0, 0, size, size, radius)
        ctx.clip()

        const pad = size * 0.14
        const avail = size - pad * 2
        const scale = Math.min(avail / img.width, avail / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        ctx.restore()

        resolve(canvas.toDataURL('image/png'))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Could not load the logo image.'))
    img.src = src
  })
}
