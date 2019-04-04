const { ipcMain, shell, systemPreferences } = require('electron');
const { getConfig, saveConfig } = require('./config');
const { getMainMenu, getEventMenu } = require('./menu');

module.exports = (app, tray, window) => {
  const { platform } = process;
  const isWindows = platform === 'win32';
  const isMacOS = platform === 'darwin';

  ipcMain.on('config-get-request', async event => {
    let config = null;

    try {
      config = await getConfig();
    } catch (err) {
      config = err;
    }

    event.sender.send('config-get-response', config);
  });

  ipcMain.on('config-save-request', async (event, data, type, firstSave) => {
    let reply = null;

    try {
      await saveConfig(data, type, firstSave);
    } catch (err) {
      console.log(err);
      reply = err;
    }

    event.sender.send('config-save-response', reply);
  });

  ipcMain.on('url-request', async (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('hide-window-request', async () => {
    window.hide();
  });

  ipcMain.on('open-main-menu-request', async (event, bounds) => {
    if (bounds && bounds.x && bounds.y) {
      bounds.x = parseInt(bounds.x.toFixed(), 10) + bounds.width / 2;
      bounds.y = parseInt(bounds.y.toFixed(), 10) - bounds.height / 2;

      const menu = await getMainMenu(app, tray, window, true);

      menu.popup({
        x: bounds.x,
        y: bounds.y
      });
    }
  });

  ipcMain.on('open-event-menu-request', async (event, bounds, spec) => {
    const { url, id, dashboardUrl } = spec;

    if (bounds && bounds.x && bounds.y) {
      const menu = await getEventMenu(url, id, dashboardUrl);

      if (!menu) {
        return;
      }

      menu.popup({
        x: bounds.x,
        y: bounds.y
      });
    }
  });

  ipcMain.on('dark-mode-request', async event => {
    let isEnabled = null;

    if (isMacOS) {
      isEnabled = systemPreferences.isDarkMode();
    } else if (isWindows) {
      isEnabled = systemPreferences.isInvertedColorScheme();
    }

    event.sender.send('dark-mode-response', isEnabled);
  });
};
