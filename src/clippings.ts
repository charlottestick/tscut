import { app } from 'electron';
import fs from 'node:fs';

export class Clipping {
  fullText: string;
  shortenedText: string;

  constructor(text: string, length: number = 80) {
    this.fullText = text;
    this.shortenedText = text.trim();
    this.shortenedText = this.shortenedText.split('/n')[0];
    this.shortenText(length);
  }

  shortenText(length: number) {
    if (this.shortenedText.length > length) {
      this.shortenedText = this.shortenedText.slice(0, length) + '…';
    }
  }
}

class ClippingStore {
  private clippings: Clipping[] = [];
  private _maxStoreLength: number = 20;
  persistPath: string;
  debugPersistPath: string;

  constructor() {
    this.persistPath = app.getPath('userData') + '/clippingStore';
    this.debugPersistPath = app.getPath('userData') + '/debugClippingStore';
    this.readPersistentStore(!app.isPackaged);
  }

  get maxStoreLength() {
    return this._maxStoreLength;
  }

  // Expose changing store length in menu?
  set maxStoreLength(value: number) {
    const valueOrMin = value < 10 ? 10 : value;
    this._maxStoreLength = valueOrMin;
    this.limitLength();
  }

  get length(): number {
    return this.clippings.length;
  }

  private limitLength(): void {
    if (this.length > this.maxStoreLength) {
      this.clippings = this.clippings.slice(0, this.maxStoreLength);
    }
  }

  add(item: string): void {
    this.clippings.forEach((clipping, index) => {
      if (clipping.fullText === item) {
        this.removeItem(index);
      }
    });

    this.clippings.unshift(new Clipping(item));
    this.limitLength();
    this.persistStore(!app.isPackaged);
  }

  clear(): void {
    this.clippings = [];
  }

  moveItemToTop(position: number): void {
    if (this.length === 0 || position >= this.length || position <= 0) {
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

  private persistStore(useDebugStore: boolean = false): void {
    const path = useDebugStore ? this.debugPersistPath : this.persistPath;

    if (this.length === 0) {
      return;
    }

    const stringifiedStore: string = JSON.stringify(this.clippings);

    fs.writeFile(path, stringifiedStore, { encoding: 'utf8' }, (err) => {
      if (err) {
        console.log('Persistent clipping store write failed: ', err.message);
      }
    });
  }

  private readPersistentStore(useDebugStore: boolean = false): void {
    const path = useDebugStore ? this.debugPersistPath : this.persistPath;

    fs.readFile(path, { encoding: 'utf8' }, (err, persistentStore: string) => {
      try {
        if (err) {
          throw err;
        }

        if (persistentStore.length === 0) {
          return;
        }

        this.clippings = JSON.parse(persistentStore);
        this.limitLength();
      } catch (e) {
        console.log(
          'Persistent clipping store read failed: ',
          (e as Error).message
        );
      }
    });
  }

  resetPersistentStore(useDebugStore: boolean = false): void {
    if (app.isPackaged) {
      return;
    }
    const path = useDebugStore ? this.debugPersistPath : this.persistPath;

    fs.rm(path, (err) => {
      if (err) {
        console.log('Delete persistent clipping store failed: ', err.message);
      }
    });
    this.persistStore(useDebugStore);
  }
}

// Could we have multiple clipping stacks/stores for keeping workspaces separate?
export class ClippingStack {
  store: ClippingStore;
  position: number = 0;
  wrapAround: boolean = true;

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
    } else if (this.wrapAround) {
      this.position = this.length - 1;
    }
  }

  down(): void {
    const newPosition = this.position + 1;
    if (newPosition < this.store.length) {
      this.position = newPosition;
    } else if (this.wrapAround) {
      this.position = 0;
    }
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
