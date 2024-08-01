import { app, MessageChannelMain, MessagePortMain } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';

// Component variable declarations
let stack;
let menu;
let trayItem: TrayItem;
let trayPort: MessagePortMain;
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

  const trayChannel = new MessageChannelMain();
  trayPort = trayChannel.port1;
  trayPort.on('message', (event) => {
    switch (event.data) {
      case 'debugShow':
        bezel.show();
        break;
      case 'debugHide':
        bezel.hide();
        break;
      default:
        break;
    }
  });
  trayPort.start();
  trayItem = new TrayItem(trayChannel.port2);
};

app.on('ready', onReady);
