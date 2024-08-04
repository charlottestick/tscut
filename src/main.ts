import { app } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';
import { HotkeyListener } from './hotkeyListener';
import { ClippingStack } from './clippings';
import { Interactions } from './interactions';
import { Clipboard } from './clipboard';
import { updateElectronApp } from 'update-electron-app';

// Component declarations
let stack: ClippingStack;
let menu;
let trayItem: TrayItem;
let bezel: Bezel;
let hotkeyListener: HotkeyListener;
let interactions: Interactions;
let clipboard: Clipboard;

function onClipboardChange(): void {
  stack.add(clipboard.item);
}

class Tscut {
  onReady(): void {
    // Initialise components like tray item, clipping stack, interaction manager, menu, ketkey listener
    bezel = new Bezel();
    stack = new ClippingStack();
    clipboard = new Clipboard(() => {
      onClipboardChange();
    });

    trayItem = new TrayItem();
    trayItem.setDebugHandlers({
      show: () => bezel.show(),
      hide: () => bezel.hide(),
    });

    interactions = new Interactions({
      stack: stack,
      bezel: bezel,
      clipboard: clipboard,
    });
    interactions.setKeyHandlers();

    hotkeyListener = new HotkeyListener(() => {
      if (!bezel.shown) {
        interactions.displayBezelAtPosition(stack.position);
      } else {
        stack.down();
        interactions.displayBezelAtPosition(stack.position);
      }
    });
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

updateElectronApp({
  updateInterval: '1 day',
});

if (app.isPackaged && !app.getLoginItemSettings().openAtLogin) {
  app.setLoginItemSettings({ openAtLogin: true });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const tscut = new Tscut();
app.on('ready', tscut.onReady);
