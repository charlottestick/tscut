import { app } from 'electron';
import { updateElectronApp } from 'update-electron-app';
import path from 'node:path';
import { Tscut } from './tscut';
import iconUrl from './icons/jumpcut blue icon 256.png';

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
    const updateExe = path.resolve(appFolder, '..', 'Update.exe');
    const exeName = path.basename(process.execPath);

    app.setLoginItemSettings({
      openAtLogin: true,
      path: updateExe,
      args: [
        '--processStart',
        `"${exeName}"`,
        '--process-start-args',
        '"--hidden"',
      ],
    });
  }
} else if (process.platform === 'darwin') {
  if (app.isPackaged && !app.getLoginItemSettings().openAtLogin) {
    app.setLoginItemSettings({
      openAtLogin: true,
    });
  }
}

if (!app.requestSingleInstanceLock()) {
  console.log('Already running another instance');
  app.quit();
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
