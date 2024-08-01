import { app } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';

// Component variable declarations
let stack;
let menu;
let trayItem: TrayItem;
let bezel: Bezel;
let hotkeyListeners;
let hotkey;
let interactions;
let pasteboard;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const onReady = (): void => {
  // Initialise components like tray item, clipping stack, interaction manager, menu, ketkey listener
  bezel = new Bezel();
  trayItem = new TrayItem();
};

app.on('ready', onReady);
