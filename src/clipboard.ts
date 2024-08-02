import { clipboard } from 'electron';

export class Clipboard {
  private interval: number = 0.5;
  private changeCallback: () => void;
  item: string;

  constructor(changeCallback: () => void) {
    this.changeCallback = changeCallback;
    // Call our polling function repeatedly with the given interval in ms
    setInterval(() => {
      this.pollClipboard;
    }, this.interval);
  }

  set(text: string): void {
    // Put our selected clipping into the pasteboard
    clipboard.writeText(text);
    this.item = text;
  }

  fakeControlV(): void {
    // Simulate the user pressing control-v to paste into whatever they've selected after we put our clipping into the pasteboard
  }

  private pollClipboard(): void {
    let item = clipboard.readText().trim();
    if (item !== this.item && item.length !== 0) {
      this.item = item;
      this.changeCallback();
    }
  }

  topItem(): string {
    return clipboard.readText();
  }
}
