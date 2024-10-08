import { app, safeStorage } from 'electron';
import fs from 'node:fs';

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
  private persistPath: string;

  constructor() {
    this.persistPath = app.getPath('userData') + '/clippingStore';
    this.readPersistedStore();
  }

  get maxLength() {
    return this._maxLength;
  }

  set maxLength(value: number) {
    const valueOrMin = value < 10 ? 10 : value;
    this._maxLength = valueOrMin;
    this.limitLength()
  }

  get length(): number {
    return this.clippings.length;
  }

  private limitLength(): void {
    if (this.length > this.maxLength) {
      this.clippings = this.clippings.slice(0, this.maxLength)
    }
  }

  add(item: string): void {
    this.clippings.forEach((clipping, index) => {
      if (clipping.fullText === item) {
        this.removeItem(index);
      }
    });

    this.clippings.unshift(new Clipping(item));
    this.limitLength()
    this.persistStore();
  }

  clear(): void {
    this.clippings = [];
  }

  moveItemToTop(position: number): void {
    if (
      this.length === 0 ||
      position >= this.length ||
      position <= 0
    ) {
      return;
    }

    const item = this.clippings.splice(position, 1)[0];
    this.clippings.unshift(item);
    this.persistStore();
  }

  itemAt(position: number): Clipping | undefined {
    if (this.length === 0 || position >= this.length) {
      return;
    }
    return this.clippings[position];
  }

  removeItem(position: number): void {
    if (this.length === 0 || position >= this.length) {
      return;
    }
    this.clippings.splice(position, 1);
    this.persistStore();
  }

  firstItems(n: number): Clipping[] {
    let slice = this.clippings;
    if (n < this.length) {
      slice = this.clippings.slice(0, n);
    }
    return slice;
  }

  private persistStore(): void {
    if (this.length === 0) {
      return;
    }

    const plaintextStore: string = JSON.stringify(this.clippings);

    let encryptedStore: Buffer;
    try {
      encryptedStore = safeStorage.encryptString(plaintextStore);
    } catch (e) {
      console.log(
        'Persistent clipping store encryption failed: ',
        (e as Error).message
      );
      return;
    }

    fs.writeFile(this.persistPath, encryptedStore, (err) => {
      if (err) {
        console.log('Persistent clipping store write failed: ', err.message);
      }
    });
  }

  private readPersistedStore(): void {
    fs.readFile(this.persistPath, (err, encryptedStore: Buffer) => {
      if (err) {
        console.log('Persistent clipping store read failed: ', err.message);
        return;
      }

      if (encryptedStore.length === 0) {
        return;
      }

      let plaintextStore: string;
      try {
        plaintextStore = safeStorage.decryptString(encryptedStore);
      } catch (e) {
        console.log(
          'Persistent clipping store decryption failed: ',
          (e as Error).message
        );
        return;
      }

      try {
        this.clippings = JSON.parse(plaintextStore);
        this.limitLength()
      } catch (e) {
        console.log(
          'Persistent clipping store JSON parse failed: ',
          (e as Error).message
        );
        return;
      }
    });
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
    return this.length === 0;
  }

  firstItems(n: number): Clipping[] {
    return this.store.firstItems(n);
  }

  clear(): void {
    this.store.clear();
  }

  deleteAt(position: number): void {
    if (position >= this.length) {
      return;
    }

    this.store.removeItem(position);
    if (this.length === 0) {
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
