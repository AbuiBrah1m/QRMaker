import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'node:path'

// Vite configuration wiring together the React renderer and the Electron
// main/preload processes.
//
// `base` must be a relative './' for the *built* app so assets resolve when the
// renderer is loaded from disk via file:// in the packaged app. In dev the base
// must stay '/' or the Vite dev-server client/HMR fails to load (blank window).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  resolve: {
    alias: { '@': path.join(__dirname, 'src') },
  },
  plugins: [
    react(),
    electron({
      // Electron main process.
      main: {
        entry: 'electron/main.ts',
      },
      // Secure preload script (contextBridge). Emitted as `preload.mjs`.
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Renderer runs inside Electron; keep defaults.
      renderer: {},
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
}))
