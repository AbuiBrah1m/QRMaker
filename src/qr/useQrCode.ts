import QRCodeStyling from 'qr-code-styling'
import { useEffect, useRef } from 'react'
import { buildQrOptions, type QrConfig } from './qrEngine'

export type ExportFormat = 'png' | 'svg' | 'jpeg'

interface ExportOptions {
  size: number
  transparent: boolean
}

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

export function useQrCode(cfg: QrConfig) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

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
  }, [])

  useEffect(() => {
    qrRef.current?.update({ ...buildQrOptions(cfg), type: 'canvas' })
  }, [cfg])

  async function exportQr(format: ExportFormat, options: ExportOptions) {
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
