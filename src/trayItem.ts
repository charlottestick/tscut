import {
  app,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  Tray,
} from 'electron';
import iconUrl from './icons/jumpcut blue icon 32.png';
import { join } from 'path';

export class TrayItem {
  private trayItem: Tray;
  private menu: Menu;

  constructor() {
    // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
    let icon: string;
    icon = join(app.getAppPath(), '.webpack/main', iconUrl);

    this.trayItem = new Tray(icon);
    let tooltip = app.isPackaged ? 'tscut' : 'tscut [dev]';
    this.trayItem.setToolTip(tooltip);
    this.trayItem.addListener('click', () => {
      this.trayItem.popUpContextMenu();
    });

    this.menu = new Menu();
  }

  createMenu(menu: MenuItemConstructorOptions[]): void {
    menu.forEach((template, index) => {
      const menuItem = new MenuItem(template);
      this.menu.insert(index, menuItem);
    });

    this.trayItem.setContextMenu(this.menu);
  }
}
