import { Bezel } from './bezel';
import { ClippingStack } from './clippings';
import { Clipboard } from './clipboard';

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
    this.clipboard  = inputs.clipboard;
  }
}
