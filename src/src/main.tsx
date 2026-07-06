import ReactDOM from 'react-dom/client'

// Bundle the Inter font locally through @fontsource (no external CDN calls).
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import './index.css'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import { ToastProvider } from './hooks/useToast'

/**
 * Shows a readable error overlay instead of leaving a silent black screen if
 * the renderer throws during startup. It appends a separate overlay element to
 * <body> (rather than overwriting #root) so it never disturbs React's DOM and
 * can never mask the true first error with a follow-on removeChild cascade.
 */
let fatalShown = false
function showFatal(message: string) {
  if (fatalShown) return
  fatalShown = true
  const el = document.createElement('div')
  el.setAttribute('data-fatal-overlay', '')
  el.style.cssText =
    'position:fixed;inset:0;z-index:9999;font-family:Inter,system-ui,sans-serif;color:#ecebf8;background:#0b0b12;display:flex;align-items:center;justify-content:center;padding:32px;text-align:center;'
  el.innerHTML = `
    <div style="max-width:560px;">
      <div style="font-size:20px; font-weight:700; margin-bottom:8px;">QR Studio failed to start</div>
      <div style="font-size:13px; color:#969cb4; white-space:pre-wrap;">${message}</div>
      <div style="font-size:12px; color:#6b7085; margin-top:16px;">Open DevTools (Ctrl+Shift+I) and check the Console for details.</div>
    </div>`
  document.body.appendChild(el)
}

window.addEventListener('error', (e) => showFatal(String(e.message)))
window.addEventListener('unhandledrejection', (e) =>
  showFatal(String((e as PromiseRejectionEvent).reason)),
)

try {
  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root was not found.')

  // Note: React.StrictMode is intentionally omitted. Its dev-only double
  // mount/unmount conflicts with framer-motion's AnimatePresence exit handling
  // ("Failed to execute 'removeChild' on 'Node'"). Production is unaffected.
  ReactDOM.createRoot(container).render(
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>,
  )
} catch (err) {
  showFatal((err as Error).message)
}
