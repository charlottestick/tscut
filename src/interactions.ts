import { Bezel } from './bezel';
import { Clipping, ClippingStack } from './clippings';
import { Clipboard } from './clipboard';
import { ClippingDisplay } from './preload';

export class Interactions {
  private stack: ClippingStack;
  private bezel: Bezel;
  private clipboard: Clipboard;

  constructor(inputs: {
    stack: ClippingStack;
    bezel: Bezel;
    clipboard: Clipboard;
  }) {
    this.stack = inputs.stack;
    this.bezel = inputs.bezel;
    this.clipboard = inputs.clipboard;
  }

  setKeyHandlers(): void {
    this.bezel.setKeyHandler((_event, input) => {
      if (input.type === 'keyDown') {
        if (input.key === 'V') {
          if (input.shift) {
            this.stack.up();
            this.displayBezelAtPosition(this.stack.position);
          } else {
            this.stack.down();
            this.displayBezelAtPosition(this.stack.position);
          }
        } else {
          this.bezelKeyDownBehaviour(input.key);
        }
      }
    });
  }

  bezelKeyDownBehaviour(key: string): void {
    switch (key) {
      case 'Escape':
        this.bezel.hide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        this.stack.down();
        this.displayBezelAtPosition(this.stack.position);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        this.stack.up();
        this.displayBezelAtPosition(this.stack.position);
        break;
      case 'Enter':
        this.bezelSelection();
        break;
      case 'Delete':
        this.stack.delete();
        if (this.stack.isEmpty()) {
          this.bezel.hide();
        } else {
          this.displayBezelAtPosition(this.stack.position);
        }
        break;
      default:
        break;
    }
  }

  place(clipping: Clipping): void {
    this.clipboard.set(clipping.fullText);
    this.bezel.hide();
  }

  paste(clipping: Clipping): void {
    this.place(clipping);
    setTimeout(() => {
      this.clipboard.fakeControlV();
    }, 200);
  }

  bezelSelection(): void {
    this.stack.moveItemToTop(this.stack.position);
    this.stack.position = 0;
    const clipping = this.stack.itemAt(this.stack.position);
    if (clipping === undefined) {
      this.bezel.hide();
      return;
    }

    this.paste(clipping);
  }

  displayBezelAtPosition(position: number): void {
    let clippingDisplay: ClippingDisplay;

    if (this.stack.isEmpty()) {
      // Show some message that the stack is empty
      clippingDisplay = {
        content: '',
        stackNumber: '0 of 0',
      };
    } else {
      const item = this.stack.itemAt(position);
      if (item === undefined) {
        return;
      }

      const text = item.fullText;
      const displayPosition = position + 1;
      clippingDisplay = {
        content: text,
        stackNumber: displayPosition + ' of ' + this.stack.length,
      };
    }

    this.bezel.setText(clippingDisplay);
    if (!this.bezel.shown) {
      this.bezel.show();
    }
  }
}
