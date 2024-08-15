export class Clipping {
  fullText: string;
  shortenedText: string;
  length: number;
  private defaultLength = 80;

  constructor(text: string) {
    this.fullText = text;
    this.length = this.defaultLength;
    this.shortenedText = this.fullText.trim();
    this.shortenedText = this.shortenedText.split('/n')[0];
    if (this.shortenedText.length > this.length) {
      this.shortenedText = this.shortenedText.slice(0, this.length) + '…';
    }
  }
}

class ClippingStore {
  private clippings: Clipping[] = [];
  private _maxLength: number = 30;

  get maxLength() {
    return this._maxLength;
  }

  set maxLength(value: number) {
    const valueOrMin = value < 10 ? 10 : value;
    this.clippings = this.clippings.slice(0, valueOrMin);
    this._maxLength = valueOrMin;
  }

  get length(): number {
    return this.clippings.length;
  }

  add(item: string): void {
    this.clippings.unshift(new Clipping(item));
    if (this.clippings.length > this.maxLength) {
      this.clippings.pop();
    }
  }

  clear(): void {
    this.clippings = [];
  }

  moveItemToTop(position: number): void {
    if (
      this.clippings.length === 0 ||
      position >= this.clippings.length ||
      position <= 0
    ) {
      return;
    }

    const item = this.clippings.splice(position, 1)[0];
    this.clippings.unshift(item);
  }

  itemAt(position: number): Clipping | undefined {
    if (this.clippings.length === 0 || position >= this.clippings.length) {
      return;
    }
    return this.clippings[position];
  }

  removeItem(position: number): void {
    if (this.clippings.length === 0 || position >= this.clippings.length) {
      return;
    }
    this.clippings.splice(position, 1);
  }

  firstItems(n: number): Clipping[] {
    let slice: Clipping[];
    if (n > this.clippings.length) {
      slice = this.clippings;
    } else {
      slice = this.clippings.slice(0, n);
    }
    return slice;
  }
}

export class ClippingStack {
  private store: ClippingStore;
  position: number = 0;

  constructor() {
    this.store = new ClippingStore();
  }

  get length() {
    return this.store.length;
  }

  isEmpty(): boolean {
    return this.store.length === 0;
  }

  firstItems(n: number): Clipping[] {
    return this.store.firstItems(n);
  }

  clear(): void {
    this.store.clear();
  }

  deleteAt(position: number): void {
    if (position >= this.store.length) {
      return;
    }

    this.store.removeItem(position);
    if (this.store.length === 0) {
      this.position = 0;
    } else if (this.position > 0 && this.position >= position) {
      this.position -= 1;
    }
  }

  delete(): void {
    this.deleteAt(this.position);
  }

  add(item: string): void {
    this.store.add(item);
  }

  up(): void {
    const newPosition = this.position - 1;
    if (newPosition >= 0) {
      this.position = newPosition;
    }
    // Wraparound logic goes here if the setting is implemented
  }

  down(): void {
    const newPosition = this.position + 1;
    if (newPosition < this.store.length) {
      this.position = newPosition;
    }
    // Wraparound logic goes here if the setting is implemented
  }

  move(steps: number): void {
    if (this.length <= 0) {
      return;
    }

    if (steps > 0) {
      this.position = Math.min(this.position + steps, this.length - 1);
    } else {
      this.position = Math.max(0, this.position + steps);
    }
  }

  itemAt(position: number): Clipping | undefined {
    return this.store.itemAt(position);
  }

  moveItemToTop(position: number): void {
    this.store.moveItemToTop(position);
  }
}
