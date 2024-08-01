// Renderer process has no access to Node or main process modules
// We can use this script to expose a custom API between the main process and the renderer
import { contextBridge, ipcRenderer } from 'electron';

// This type will move once the Clipping class is implemented
export type Clipping = {
  stackNumber: string;
  source: string;
  timestamp: string;
  content: string;
};

export type ClippingsApi = {
  onShowClipping: (handler: (clipping: Clipping) => void) => void;
};

const clippingsApi: ClippingsApi = {
  onShowClipping: (handler) =>
    ipcRenderer.on('showClipping', (_event, clipping) => handler(clipping)),
};

contextBridge.exposeInMainWorld('clippings', clippingsApi);

