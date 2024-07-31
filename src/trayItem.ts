import { app, Menu, nativeImage, Tray } from "electron";

export class TrayItem {
  private trayItem: Tray;

  constructor() {
    this.createTrayItem();
  }

  private createTrayItem(): void {
    // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
    const icon = nativeImage
      .createFromPath("icons/jumpcut blue icon 32.png")
      .resize({ width: 30, height: 30, quality: "best" });
    this.trayItem = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      { label: "Exit tscut", id: "exit", type: "normal" },
    ]);

    this.trayItem.setContextMenu(contextMenu);
    this.trayItem.addListener("click", () => {
      this.trayItem.popUpContextMenu();
    });

    // Menu item handlers
    contextMenu.getMenuItemById("exit").click = () => {
      this.trayItem.destroy();
      app.quit();
    };
  }
}
