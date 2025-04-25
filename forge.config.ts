import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDeb } from '@electron-forge/maker-deb';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    icon: 'src/icons/jumpcut blue icon',
    name: 'tscut',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: 'src/icons/jumpcut blue icon.ico',
      setupExe: 'tscut-setup.exe',
    }),
    new MakerDeb({
      options: {
        icon: 'src/icons/jumpcut blue icon 256.png',
        categories: ['Utility', 'Development'],
      },
    }),
    new MakerDMG({ icon: 'src/icons/jumpcut blue icon.icns' }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'charlottestick',
          name: 'tscut',
        },
        draft: true,
      },
    },
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/bezel.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
      loggerPort: 9001,
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    }),
  ],
};

export default config;
