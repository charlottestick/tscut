import { globalShortcut } from 'electron';

export class HotkeyListener {
  constructor(hotkeyHandler: () => void) {
    const keybind =
      process.platform === 'darwin' ? 'Control+Command+V' : 'Control+Alt+V';
    globalShortcut.register(keybind, () => {
      hotkeyHandler();
    });
  }
}
