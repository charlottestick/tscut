import { app } from 'electron';
import { updateElectronApp } from 'update-electron-app';
import path from 'node:path';
import { Tscut } from './tscut';
import iconUrl from './icons/jumpcut blue icon 256.png';

app.requestSingleInstanceLock();

// New instance takes precedence in case we can't quit the current instance (i.e. tray item isn't working)
app.on('second-instance', () => {
  console.log('Another instance started');
  app.quit();
});

if (process.platform === 'win32') {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require('electron-squirrel-startup')) {
    app.quit();
  }

  updateElectronApp({
    updateInterval: '4 hours',
  });

  // Login items API isn't available on linux, but can be set manually by the user in their settings
  if (app.isPackaged && !app.getLoginItemSettings().openAtLogin) {
    const appFolder = path.dirname(process.execPath);
    const exeName = path.basename(process.execPath);
    const stubLauncher = path.resolve(appFolder, '..', exeName);

    app.setLoginItemSettings({
      openAtLogin: true,
      path: stubLauncher,
    });
  }
}

app.setAboutPanelOptions({
  applicationName: 'tscut',
  applicationVersion: 'v' + app.getVersion(),
  credits: 'Charlotte Stick',
  authors: ['Charlotte Stick'],
  iconPath: path.join(app.getAppPath(), '.webpack/main', iconUrl),
});

app.on('ready', () => {
  new Tscut();
});
