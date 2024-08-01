import { BrowserWindow, Menu } from 'electron';
import { ClippingDisplay } from './preload';
import { Clipping } from './clippings';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class Bezel {
  private bezel: BrowserWindow;
  shown: boolean;

  constructor() {
    // Create the browser window.
    // Frame false removes the toolbars and menus around the rendered web page
    this.bezel = new BrowserWindow({
      height: 600,
      width: 800,
      frame: false,
      transparent: true,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      },
    });

    this.bezel.setSkipTaskbar(true);
    this.hide()

    // and load the index.html of the app.
    this.bezel.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Menu won't be shown anyway because it's a frameless window,
    // but removing just in case as a default menu is created and might have some random hotkeys we don't want
    Menu.setApplicationMenu(null);

    // // Just for debugging the ipc flow
    // this.bezel.webContents.on('before-input-event', (_, input) => {
    //   if (input.key === 'Enter' && input.type === 'keyDown') {
    //     const clipping: Clipping = {
    //       stackNumber: '1 of 1',
    //       source: 'tscut',
    //       timestamp: '3:21 PM, 1st August 2024',
    //       content: 'Text sent to renderer'
    //     }
    //     this.setText(clipping)
    //   }
    // })
  }

  setText(clipping: ClippingDisplay) {
    this.bezel.webContents.send('showClipping', clipping);
  }

  hide(): void {
    this.bezel.hide()
    this.bezel.blur() // Just in case it's still focus
    this.shown = false;
  }

  show(): void {
    this.bezel.show()
    this.shown = true;
  }
}
