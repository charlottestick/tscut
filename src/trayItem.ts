import {
  app,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  NativeImage,
  nativeImage,
  Tray,
} from 'electron';
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
    let tooltip = app.isPackaged ? 'tscut [dev]' : 'tscut';
    this.trayItem.setToolTip(tooltip);
    this.trayItem.addListener('click', () => {
      this.trayItem.popUpContextMenu();
    });

    this.menu = Menu.buildFromTemplate([
      {
        label: 'Exit tscut',
        click: () => {
          this.trayItem.destroy();
          app.releaseSingleInstanceLock();
          app.setLoginItemSettings({ openAtLogin: false });
          app.quit();
        },
      },
    ]);

    this.trayItem.setContextMenu(this.menu);
  }

  createDebugMenu(submenu: MenuItemConstructorOptions[]): void {
    if (app.isPackaged) {
      return;
    }

    const debugMenu = new MenuItem({
      label: 'Debug',
      id: 'debugMenu',
      submenu,
    });
    this.menu.insert(0, debugMenu);
  }
}
