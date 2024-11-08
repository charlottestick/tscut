import { BrowserWindow, Menu, screen } from 'electron';
import { ClippingDisplay } from './preload';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class Bezel {
  private bezel: BrowserWindow;
  shown: boolean = false;
  hideOnBlur: boolean = true;

  constructor() {
    // Handle running in the background with no taskbar item for different platforms
    let skipTaskbar = process.platform === 'win32'
    let type = process.platform === 'linux' ? 'dock': undefined

    // Create the browser window.
    // Frame false removes the toolbars and menus around the rendered web page
    this.bezel = new BrowserWindow({
      height: 600,
      width: 800,
      frame: false,
      transparent: true,
      skipTaskbar,
      type,
      show: false,
      movable: false, // moveable and resizeable might be redundant as there is no frame for the user to interact with
      resizable: false,
      useContentSize: true,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    // and load the index.html of the app.
    this.bezel.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    this.bezel.on('blur', () => {
      if (this.hideOnBlur) {
        this.hide();
      }
    });

    // Menu won't be shown anyway because it's a frameless window,
    // but removing just in case as a default menu is created and might have some random hotkeys we don't want
    Menu.setApplicationMenu(null);
  }

  setText(clipping: ClippingDisplay) {
    this.bezel.webContents.send('showClipping', clipping);
  }

  hide(): void {
    // Minimize returns focus to the previous app before we gained focus,
    // this allows us to paste into whatever was focussed with our fake control-v
    this.bezel.minimize();
    this.shown = false;
  }

  show(): void {
    this.bezel.show();
    const cursorDipPosition = screen.getCursorScreenPoint();
    const closestDisplay = screen.getDisplayNearestPoint(cursorDipPosition);
    this.bezel.setPosition(closestDisplay.bounds.x, closestDisplay.bounds.y);
    this.bezel.center();
    this.shown = true;
  }

  setKeyHandler(
    handler: (event: Electron.Event, input: Electron.Input) => void
  ): void {
    this.bezel.webContents.on('before-input-event', handler);
  }
}
