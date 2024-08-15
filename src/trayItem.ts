import { app, Menu, MenuItem, NativeImage, nativeImage, Tray } from 'electron';
import iconUrl from './icons/jumpcut blue icon 32.png';
import { join } from 'path';

export class TrayItem {
  private trayItem: Tray;
  private menu: Menu;

  constructor() {
    // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
    let icon: NativeImage;
    if (app.isPackaged) {
      icon = nativeImage.createFromPath(
        join('resources/app/.webpack/main', iconUrl)
      );
    } else {
      icon = nativeImage.createFromPath('src/icons/jumpcut blue icon 32.png');
    }

    this.trayItem = new Tray(icon);
    this.trayItem.setToolTip('tscut');
    this.trayItem.addListener('click', () => {
      this.trayItem.popUpContextMenu();
    });

    this.menu = Menu.buildFromTemplate([{ label: 'Exit tscut', id: 'exit' }]);

    if (!app.isPackaged) {
      const debugMenu = new MenuItem({
        label: 'Debug',
        id: 'id',
        submenu: [
          {
            label: 'Show bezel',
            id: 'debugShow',
          },
          {
            label: 'Hide bezel',
            id: 'debugHide',
          },
        ],
      });
      this.menu.insert(0, debugMenu);
    }

    this.trayItem.setContextMenu(this.menu);

    // Menu item handlers
    this.menu.getMenuItemById('exit')!.click = () => {
      this.trayItem.destroy();
      app.releaseSingleInstanceLock();
      app.setLoginItemSettings({ openAtLogin: false });
      app.quit();
    };
  }

  setDebugHandlers(handlers: { show: () => void; hide: () => void }): void {
    if (!app.isPackaged) {
      this.menu.getMenuItemById('debugShow')!.click = handlers.show;
      this.menu.getMenuItemById('debugHide')!.click = handlers.hide;
    }
  }
}
