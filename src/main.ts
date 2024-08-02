import { app } from 'electron';
import { TrayItem } from './trayItem';
import { Bezel } from './bezel';
import { HotkeyListener } from './hotkeyListener';
import { ClippingDisplay } from './preload';
import { ClippingStack } from './clippings';
import { Interactions } from './interactions';
import { Clipboard } from './clipboard';

class Tscut {
  // Component declarations
  stack: ClippingStack;
  // menu;
  trayItem: TrayItem;
  bezel: Bezel;
  hotkeyListener: HotkeyListener;
  interactions: Interactions;
  clipboard: Clipboard;

  onReady(): void {
    // Initialise components like tray item, clipping stack, interaction manager, menu, ketkey listener
    this.bezel = new Bezel();
    this.stack = new ClippingStack();
    this.clipboard = new Clipboard(() => {
      this.onClipboardChange();
    });
    this.trayItem = new TrayItem();
    this.trayItem.setDebugHandlers({
      show: () => this.bezel.show(),
      hide: () => this.bezel.hide(),
    });
    this.interactions = new Interactions({
      stack: this.stack,
      bezel: this.bezel,
      clipboard: this.clipboard,
    });

    this.stack.add(
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim dignissimos architecto quibusdam harum, ut vero laborum provident! Iusto ipsam, non, esse odio veritatis odit accusamus voluptatem eligendi laborum provident voluptatibus.'
    );

    this.hotkeyListener = new HotkeyListener(() => {
      const clipping: ClippingDisplay = {
        stackNumber: this.stack.position + 1 + ' of ' + this.stack.length,
        // source: 'tscut',
        // timestamp: '3:21 PM, 1st August 2024',
        content: this.stack.itemAt(this.stack.position)?.shortenedText || '',
      };
      this.bezel.setText(clipping);
      this.bezel.show();
    });
  }

  onClipboardChange(): void {}
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const tscut = new Tscut();
app.on('ready', tscut.onReady);
