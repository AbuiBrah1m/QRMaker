import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { Splash } from './components/Splash'
import { Card } from './components/Card'
import { UrlInput } from './components/UrlInput'
import { LogoPicker } from './components/LogoPicker'
import { ColorModePanel } from './components/ColorModePanel'
import { ShapePanel } from './components/ShapePanel'
import { ExportPanel } from './components/ExportPanel'
import { QrPreview } from './components/QrPreview'
import { useDebounce } from './hooks/useDebounce'
import { useToast } from './hooks/useToast'
import { DEFAULT_CONFIG, type QrConfig } from './qr/qrEngine'
import { useQrCode, type ExportFormat } from './qr/useQrCode'
import { isValidUrl, normalizeUrl } from './utils/validation'
import { processLogo } from './utils/logoShape'

const MODE_LABELS: Record<QrConfig['colorMode'], string> = {
  solid: 'Solid',
  two: 'Two-color',
  rainbow: 'Rainbow',
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const [rawUrl, setRawUrl] = useState('')
  const [touched, setTouched] = useState(false)
  const [cfg, setCfg] = useState<QrConfig>(DEFAULT_CONFIG)
  const toast = useToast()

  const valid = isValidUrl(rawUrl)

  const [processedLogo, setProcessedLogo] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!cfg.logo) {
      setProcessedLogo(null)
      return
    }
    processLogo(cfg.logo, cfg.logoShape)
      .then((url) => {
        if (!cancelled) setProcessedLogo(url)
      })
      .catch(() => {
        if (!cancelled) setProcessedLogo(cfg.logo)
      })
    return () => {
      cancelled = true
    }
  }, [cfg.logo, cfg.logoShape])

  const effectiveCfg = useMemo<QrConfig>(
    () => ({
      ...cfg,
      data: valid ? normalizeUrl(rawUrl) : '',
      logo: processedLogo,
    }),
    [cfg, rawUrl, valid, processedLogo],
  )
  const debounced = useDebounce(effectiveCfg, 200)
  const { containerRef, exportQr } = useQrCode(debounced)
  const signature = useMemo(() => JSON.stringify(debounced), [debounced])

  function patch(next: Partial<QrConfig>) {
    setCfg((current) => ({ ...current, ...next }))
  }

  async function handlePickLogo() {
    try {
      const result = await window.api.pickImage()
      if (!result) return
      if ('error' in result) {
        toast('Could not read that image file.', 'error')
        return
      }
      patch({ logo: result.dataUrl })
      toast(`Logo “${result.name}” added.`, 'success')
    } catch {
      toast('Something went wrong choosing the image.', 'error')
    }
  }

  async function handleExport(format: ExportFormat) {
    try {
      const result = await exportQr(format, {
        size: cfg.size,
        transparent: cfg.transparentBg,
      })
      if (result.saved) {
        toast(`Saved ${format.toUpperCase()} successfully.`, 'success')
      } else if (result.error) {
        toast(`Export failed: ${result.error}`, 'error')
      }
    } catch (err) {
      toast(`Export failed: ${(err as Error).message}`, 'error')
    }
  }

  return (
    <div className="app-bg relative flex h-screen w-screen flex-col overflow-hidden">
      <AnimatePresence>
        {booting && <Splash key="splash" onDone={ () => setBooting(false) } />}
      </AnimatePresence>

      <TitleBar />

      <motion.main
        initial={ { opacity: 0 } }
        animate={ { opacity: booting ? 0 : 1 } }
        transition={ { duration: 0.6, delay: 0.1 } }
        className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-6 lg:grid-cols-[1fr_minmax(400px,500px)]"
      >
        {/* Controls column */}
        <div className="order-2 flex flex-col gap-5 overflow-y-auto pr-1 lg:order-1">
          <Card title="Destination URL" delay={ 0.05 }>
            <UrlInput
              value={ rawUrl }
              valid={ valid }
              touched={ touched }
              onChange={ (v) => {
                setRawUrl(v)
                if (!touched) setTouched(true)
              } }
            />
          </Card>

          <Card title="Colors" delay={ 0.1 }>
            <ColorModePanel cfg={ cfg } onChange={ patch } />
          </Card>

          <Card title="Shapes" delay={ 0.15 }>
            <ShapePanel cfg={ cfg } onChange={ patch } />
          </Card>

          <Card title="Center logo" delay={ 0.2 }>
            <LogoPicker
              logo={ cfg.logo }
              logoSize={ cfg.logoSize }
              logoShape={ cfg.logoShape }
              onPick={ handlePickLogo }
              onRemove={ () => patch({ logo: null }) }
              onSize={ (n) => patch({ logoSize: n }) }
              onShape={ (s) => patch({ logoShape: s }) }
            />
          </Card>

          <Card title="Export" delay={ 0.25 }>
            <ExportPanel cfg={ cfg } onChange={ patch } onExport={ handleExport } />
          </Card>
        </div>

        {/* Preview column */}
        <div className="order-1 lg:order-2">
          <div className="glass flex h-full flex-col rounded-xl2 p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Live preview</h1>
                <p className="text-xs text-muted">Updates in real time</p>
              </div>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                {MODE_LABELS[cfg.colorMode]}
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <QrPreview ref={ containerRef } signature={ signature } />
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              {valid
                ? 'Encoding your link — scan to test before exporting — By AbuiBrahim.'
                : 'Showing a sample preview — enter a valid URL to encode your link — AbuiBrahim.'}
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
