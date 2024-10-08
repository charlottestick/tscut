import { app } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';
import { HotkeyListener } from './hotkeyListener';
import { ClippingStack } from './clippings';
import { Interactions } from './interactions';
import { Clipboard } from './clipboard';
import { updateElectronApp } from 'update-electron-app';
import path from 'node:path';

class Tscut {
  // Definite assignment assertions because some downstream electron APIs don't work until 'ready' event fires
  // so we're creating and assigning objects in onReady instead of a constructor
  // Could move some to a constructor as this only affets some electron APIs but it would have to be case by case
  private stack!: ClippingStack;
  private trayItem!: TrayItem;
  private bezel!: Bezel;
  private interactions!: Interactions;
  private clipboard!: Clipboard;

  onReady(): void {
    // Initialise components like tray item, clipping stack, interaction manager, menu, hotkey listener
    this.bezel = new Bezel();
    this.stack = new ClippingStack();
    this.clipboard = new Clipboard(() => {
      this.stack.add(this.clipboard.item);
    });

    this.trayItem = new TrayItem();
    this.trayItem.createDebugMenu([
      {
        label: 'Decrypt persistent storage',
        submenu: [
          {
            label: 'Debug store',
            click: () => {
              this.stack.store.decryptPersistentStore(true);
            },
          },
          {
            label: 'Prod store',
            click: () => {
              this.stack.store.decryptPersistentStore(false);
            },
          },
        ],
      },
      {
        label: 'Reset persistent storage',
        submenu: [
          {
            label: 'Debug store',
            click: () => {
              this.stack.store.resetPersistentStore(true);
            },
          },
          {
            label: 'Prod store',
            click: () => {
              this.stack.store.resetPersistentStore(false);
            },
          },
        ],
      },
      {
        label: 'Wraparound',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          this.stack.wrapAround = menuItem.checked;
        },
      },
      {
        label: 'Hide on blur',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          this.bezel.hideOnBlur = menuItem.checked;
        },
      },
      {
        label: 'Show',
        click: () => {
          this.bezel.show();
        },
      },
    ]);

    this.interactions = new Interactions({
      stack: this.stack,
      bezel: this.bezel,
      clipboard: this.clipboard,
    });

    new HotkeyListener(() => {
      if (!this.bezel.shown) {
        this.interactions.displayBezelAtPosition(this.stack.position);
      } else {
        this.stack.down();
        this.interactions.displayBezelAtPosition(this.stack.position);
      }
    });
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

updateElectronApp({
  updateInterval: '4 hours',
});

if (app.isPackaged && !app.getLoginItemSettings().openAtLogin) {
  const appFolder = path.dirname(process.execPath);
  const updateExe = path.resolve(appFolder, '..', 'Update.exe');
  const exeName = path.basename(process.execPath);

  app.setLoginItemSettings({
    openAtLogin: true,
    path: updateExe,
    args: [
      '--processStart',
      `"${exeName}"`,
      '--process-start-args',
      '"--hidden"',
    ],
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const tscut = new Tscut();
app.on('ready', tscut.onReady);
