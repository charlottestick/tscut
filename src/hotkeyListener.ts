import { globalShortcut } from 'electron';

export class HotkeyListener {
  constructor(showBezel: () => void) {
    globalShortcut.register('Control+Alt+V', () => {
      showBezel();
    });
  }
}
