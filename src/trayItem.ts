import { app, Menu, Tray } from "electron";

export class TrayItem {
  private trayItem: Tray;

  constructor() {
    this.createTrayItem();
  }

  private createTrayItem(): void {
    // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
    this.trayItem = new Tray("icons/scissors_bw16.png");

    const contextMenu = Menu.buildFromTemplate([
      { label: "Exit tscut", id: "exit", type: "normal" },
    ]);

    this.trayItem.setContextMenu(contextMenu);
    this.trayItem.addListener("click", () => {
      this.trayItem.popUpContextMenu();
    });

    // Menu item handlers
    contextMenu.getMenuItemById("exit").click = () => {
      app.quit();
    };
  }
}
