import QRCodeStyling from 'qr-code-styling'
import { useEffect, useRef } from 'react'
import { buildQrOptions, type QrConfig } from './qrEngine'

export type ExportFormat = 'png' | 'svg' | 'jpeg'

interface ExportOptions {
  size: number
  transparent: boolean
}

/** Converts a Blob to a bare base64 string (no data-url prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Owns a single `QRCodeStyling` instance for the live canvas preview and
 * exposes helpers to mount it and to export a fresh high-resolution copy.
 */
export function useQrCode(cfg: QrConfig) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  // Create the instance once and mount it into the preview container. The
  // canvas is owned by qr-code-styling (not React), so we clean the container
  // up on unmount to avoid duplicate canvases and DOM-ownership conflicts.
  useEffect(() => {
    const container = containerRef.current
    const qr = new QRCodeStyling({
      ...buildQrOptions(cfg),
      type: 'canvas',
    })
    qrRef.current = qr
    if (container) {
      container.innerHTML = ''
      qr.append(container)
    }
    return () => {
      if (container) container.innerHTML = ''
      qrRef.current = null
    }
    // Only run on mount; updates are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render the preview whenever the config changes.
  useEffect(() => {
    qrRef.current?.update({ ...buildQrOptions(cfg), type: 'canvas' })
  }, [cfg])

  /**
   * Renders a brand-new instance at the requested export size/format and hands
   * the bytes to the main process to be written to disk via a save dialog.
   */
  async function exportQr(format: ExportFormat, options: ExportOptions) {
    // JPG has no alpha channel, so transparency is forced off for it.
    const transparent = format === 'jpeg' ? false : options.transparent
    const opts = buildQrOptions({
      ...cfg,
      size: options.size,
      transparentBg: transparent,
    })

    const instance = new QRCodeStyling({
      ...opts,
      type: format === 'svg' ? 'svg' : 'canvas',
    })

    const raw = await instance.getRawData(format)
    if (!raw) throw new Error('The QR code could not be rendered.')

    const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart])
    const base64 = await blobToBase64(blob)
    const ext = format === 'jpeg' ? 'jpg' : format

    return window.api.saveFile({
      defaultName: `qr-code.${ext}`,
      ext,
      base64,
    })
  }

  return { containerRef, exportQr }
}
