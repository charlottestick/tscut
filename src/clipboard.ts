import { clipboard } from 'electron';
import { keyTap, setKeyboardDelay } from '@jitsi/robotjs';

export class Clipboard {
  private interval: number = 500;
  private changeCallback: () => void;
  private commandOrControl: string;
  item: string = '';

  constructor(changeCallback: () => void) {
    this.changeCallback = changeCallback;
    this.commandOrControl =
      process.platform === 'darwin' ? 'command' : 'control';

    // Call our polling function repeatedly with the given interval in ms
    setInterval(() => {
      this.pollClipboard();
    }, this.interval);
  }

  private pollClipboard(): void {
    let item = clipboard.readText();
    if (item !== this.item && item.trim().length !== 0) {
      this.item = item;
      this.changeCallback();
    }
  }

  set(text: string): void {
    // Put our selected clipping into the pasteboard
    clipboard.writeText(text);
    this.item = text;
  }

  fakeControlV(): void {
    // Simulate the user pressing control-v to paste into whatever they've selected after we put our clipping into the pasteboard
    setKeyboardDelay(0);
    keyTap('v', this.commandOrControl);
  }
}
