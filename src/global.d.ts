import type { Api } from '../electron/preload'

// Makes the preload-exposed bridge strongly typed in the renderer.
declare global {
  interface Window {
    api: Api
  }
}

export {}
