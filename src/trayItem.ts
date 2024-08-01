import { app, Menu, MessagePortMain, nativeImage, Tray } from 'electron';

export class TrayItem {
  private trayItem: Tray;
  private menu: Menu;
  port: MessagePortMain

  constructor(mainPort: MessagePortMain) {
    // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
    const icon = nativeImage
      .createFromPath('icons/jumpcut blue icon 32.png')
      .resize({ width: 30, height: 30, quality: 'best' });
    this.trayItem = new Tray(icon);

    this.port = mainPort;

    this.menu = Menu.buildFromTemplate([
      {
        label: 'Debug',
        id: 'debug',
        submenu: [
          { label: 'Show bezel', id: 'debugShow', click: () => this.port.postMessage('debugShow') },
          { label: 'Hide bezel', id: 'debugHide', click: () => this.port.postMessage('debugHide') },
        ],
      },
      { label: 'Exit tscut', id: 'exit' },
    ]);

    this.trayItem.setContextMenu(this.menu);
    this.trayItem.setTitle('tscut');

    this.trayItem.addListener('click', () => {
      this.trayItem.popUpContextMenu();
    });

    // Menu item handlers
    this.menu.getMenuItemById('exit').click = () => {
      this.trayItem.destroy();
      app.quit();
    };
  }
}
