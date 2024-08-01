import { app, MessageChannelMain, MessagePortMain } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';
import { HotkeyListener } from './hotkeyListener';
import { ClippingDisplay } from './preload';
import { ClippingStack } from './clippings';

// Component variable declarations
let stack: ClippingStack;
let menu;
let trayItem: TrayItem;
let bezel: Bezel;
let hotkeyListener: HotkeyListener;
let interactions;
let pasteboard;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const onReady = (): void => {
  // Initialise components like tray item, clipping stack, interaction manager, menu, ketkey listener
  bezel = new Bezel();
  stack = new ClippingStack();

  trayItem = new TrayItem();
  trayItem.setDebugHandlers({
    show: () => bezel.show(),
    hide: () => bezel.hide(),
  });

  stack.add('Text stored in clipping stack');

  hotkeyListener = new HotkeyListener(() => {
    const clipping: ClippingDisplay = {
      stackNumber: stack.position + 1 + ' of ' + stack.length,
      // source: 'tscut',
      // timestamp: '3:21 PM, 1st August 2024',
      content: stack.itemAt(stack.position)?.shortenedText || '',
    };
    bezel.setText(clipping);
    bezel.show();
  });
};

app.on('ready', onReady);
