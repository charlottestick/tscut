import { Bezel } from './bezel';
import { ClippingStack } from './clippings';
import { HotkeyListener } from './hotkeyListener';
import { Interactions } from './interactions';
import { Clipboard } from './clipboard';
import { TrayItem } from './trayItem';
import { app } from 'electron';

export class Tscut {
  private stack: ClippingStack;
  private trayItem: TrayItem;
  private bezel: Bezel;
  private interactions: Interactions;
  private clipboard: Clipboard;

  constructor() {
    this.bezel = new Bezel();
    this.stack = new ClippingStack();
    this.clipboard = new Clipboard(() => {
      this.stack.add(this.clipboard.item);
    });

    this.trayItem = new TrayItem();
    this.addMenu();
    this.addDebugMenu();

    this.interactions = new Interactions({
      stack: this.stack,
      bezel: this.bezel,
      clipboard: this.clipboard,
    });

    this.createHotkeyListener();
  }

  createHotkeyListener() {
    new HotkeyListener(() => {
      if (!this.bezel.shown) {
        this.interactions.displayBezelAtPosition(this.stack.position);
      } else {
        this.stack.down();
        this.interactions.displayBezelAtPosition(this.stack.position);
      }
    });
  }

  quit(): void {
    app.releaseSingleInstanceLock();
    app.quit();
  }

  addDebugMenu(): void {
    if (app.isPackaged) {
      return;
    }

    this.trayItem.createMenu([
      {
        label: 'Debug',
        submenu: [
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
            label: 'Show',
            click: () => {
              this.bezel.show();
            },
          },
        ],
      },
      { type: 'separator' },
    ]);
  }

  addMenu(): void {
    // Should we provide an option to disable persistent storage?
    this.trayItem.createMenu([
      {
        label: 'Wraparound',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          this.stack.wrapAround = menuItem.checked;
        },
      },
      {
        label: 'Move selection to top',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          this.interactions.moveSelectionToTop = menuItem.checked;
        },
      },
      { type: 'separator' },
      {
        label: 'About',
        click: () => {
          if (process.platform === 'darwin') {
            app.show();
          }
          app.showAboutPanel();
        },
      },
      {
        label: 'Restart tscut',
        click: () => {
          app.relaunch();
          this.quit();
        },
      },
      {
        label: 'Exit tscut',
        click: () => {
          if (process.platform === 'win32') {
            app.setLoginItemSettings({ openAtLogin: false });
          }
          this.quit();
        },
      },
    ]);
  }
}
