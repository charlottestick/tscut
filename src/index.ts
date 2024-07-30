import { app, BrowserWindow, Menu, Tray } from "electron";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Component variable declarations
let stack;
let menu;
let trayItem;
let bezel;
let hotkeyListeners;
let hotkey;
let interactions;
let pasteboard;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  // Frame false removes the toolbars and menus around the rendered web page
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false,
    // transparent: true, // Might be good for the rounded corners of the bezel?
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Menu won't be shown anyway because it's a frameless window,
  // but removing just in case as a default menu is created and might have some random hotkeys we don't want
  Menu.setApplicationMenu(null);

  // Initialise components like tray item, clipping stack, interaction manager, menu, ketkey listener

  // Create an item in the notification tray area so we can exit the app once the dock/taskbar item is removed
  trayItem = new Tray("icons/scissors_bw16.png");
  const contextMenu = Menu.buildFromTemplate([
    { label: "Exit tscut", id: "exit", type: "normal" },
  ]);
  contextMenu.addListener("menu-will-close", (event: Electron.Event) => {
    app.quit();
  });
  trayItem.setContextMenu(contextMenu);
};

app.on("ready", createWindow);
