import { globalShortcut } from 'electron';

export class HotkeyListener {
  constructor(hotkeyHandler: () => void) {
    globalShortcut.register('Control+Alt+V', () => {
      hotkeyHandler();
    });
  }
}
