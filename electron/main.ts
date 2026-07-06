import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

/**
 * Resolve the compiled preload script. vite-plugin-electron may emit it as
 * either `preload.mjs` or `preload.js` depending on the version/package type,
 * so we pick whichever actually exists next to the compiled main process.
 * Loading a non-existent preload leaves `window.api` undefined and crashes the
 * renderer, so this must be correct.
 */
function resolvePreload(): string {
  const mjs = path.join(__dirname, 'preload.mjs')
  const js = path.join(__dirname, 'preload.js')
  return existsSync(mjs) ? mjs : js
}

/**
 * Electron main process.
 *
 * Responsibilities:
 *  - Create a frameless, custom-chrome BrowserWindow.
 *  - Bridge secure IPC handlers used by the renderer (window controls, native
 *    file dialogs for picking a logo and for saving exported QR files).
 */

// `APP_ROOT` points at the project root at runtime (one level above the
// compiled dist-electron folder).
process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    width: 1200,
    height: 840,
    minWidth: 980,
    minHeight: 700,
    frame: false, // custom title bar rendered in the renderer
    backgroundColor: '#0b0b12',
    show: false,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // required for the ESM (.mjs) preload script
    },
  })

  // Avoid a white flash: only show once the renderer is ready.
  win.once('ready-to-show', () => win?.show())

  // Keep the renderer informed of maximize state so the UI can swap icons.
  win.on('maximize', () => win?.webContents.send('window:maximized', true))
  win.on('unmaximize', () => win?.webContents.send('window:maximized', false))

  // Never fail silently to a black screen. In development the Vite dev server
  // may still be spinning up when Electron launches, so retry a few times.
  let retries = 0
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[main] did-fail-load ${code} (${desc}) for ${url}`)
    if (VITE_DEV_SERVER_URL && retries < 20 && code !== -3) {
      retries += 1
      setTimeout(() => win?.loadURL(VITE_DEV_SERVER_URL), 500)
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Auto-open DevTools in dev so any renderer error is immediately visible.
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(() => {
  // Apply a strict Content-Security-Policy via response headers in production
  // only. A strict CSP <meta> tag would block Vite's HMR client in dev, which
  // is a common cause of an empty/black window during development.
  if (!VITE_DEV_SERVER_URL) {
    session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
      cb({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self'; connect-src 'self'",
          ],
        },
      })
    })
  }

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

/** Registers every IPC channel used by the preload bridge. */
function registerIpcHandlers(): void {
  // --- Custom window controls -------------------------------------------
  ipcMain.on('window:minimize', () => win?.minimize())
  ipcMain.on('window:toggle-maximize', () => {
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window:close', () => win?.close())
  ipcMain.handle('window:is-maximized', () => win?.isMaximized() ?? false)

  // --- Native "pick a logo image" dialog --------------------------------
  ipcMain.handle('dialog:pick-image', async () => {
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Choose a logo image',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] },
      ],
    })
    if (result.canceled || result.filePaths.length === 0) return null

    try {
      const filePath = result.filePaths[0]
      const buffer = await fs.readFile(filePath)
      const ext = path.extname(filePath).slice(1).toLowerCase()
      const mime =
        ext === 'svg'
          ? 'image/svg+xml'
          : ext === 'jpg'
            ? 'image/jpeg'
            : `image/${ext}`
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
      return { name: path.basename(filePath), dataUrl }
    } catch {
      // Signal an unreadable-file error back to the renderer.
      return { error: 'unreadable' as const }
    }
  })

  // --- Native "save exported QR" dialog ---------------------------------
  ipcMain.handle(
    'file:save',
    async (
      _event,
      payload: { defaultName: string; ext: string; base64: string },
    ) => {
      if (!win) return { saved: false }
      const result = await dialog.showSaveDialog(win, {
        title: 'Export QR code',
        defaultPath: payload.defaultName,
        filters: [{ name: payload.ext.toUpperCase(), extensions: [payload.ext] }],
      })
      if (result.canceled || !result.filePath) return { saved: false }

      try {
        await fs.writeFile(result.filePath, Buffer.from(payload.base64, 'base64'))
        return { saved: true, path: result.filePath }
      } catch (err) {
        return { saved: false, error: (err as Error).message }
      }
    },
  )
}
