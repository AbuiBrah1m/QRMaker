import { contextBridge, ipcRenderer } from 'electron'

/**
 * Secure preload bridge.
 *
 * Everything the renderer is allowed to ask the main process to do is exposed
 * here through `window.api`. The renderer never gets direct access to Node or
 * Electron internals (contextIsolation is on).
 */

export interface PickedImage {
  name: string
  dataUrl: string
}

export interface SaveResult {
  saved: boolean
  path?: string
  error?: string
}

const api = {
  /* Window controls -------------------------------------------------- */
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () =>
    ipcRenderer.invoke('window:is-maximized') as Promise<boolean>,
  /** Subscribe to maximize/unmaximize events. Returns an unsubscribe fn. */
  onMaximizeChange: (cb: (value: boolean) => void) => {
    const listener = (_e: unknown, value: boolean) => cb(value)
    ipcRenderer.on('window:maximized', listener)
    return () => ipcRenderer.removeListener('window:maximized', listener)
  },

  /* Native dialogs --------------------------------------------------- */
  pickImage: () =>
    ipcRenderer.invoke('dialog:pick-image') as Promise<
      PickedImage | { error: 'unreadable' } | null
    >,
  saveFile: (payload: { defaultName: string; ext: string; base64: string }) =>
    ipcRenderer.invoke('file:save', payload) as Promise<SaveResult>,
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
