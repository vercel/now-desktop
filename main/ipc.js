const { ipcMain, shell, systemPreferences, dialog } = require('electron');
const fetch = require('node-fetch');
const { getConfig, getDarkModeStatus, saveConfig } = require('./config');
const { getMainMenu, getEventMenu } = require('./menu');

const isCanary = async () => {
  const { updateChannel } = await getConfig();
  return updateChannel && updateChannel === 'canary';
};

module.exports = (app, tray, window) => {
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
    let config = null;

    try {
      config = await saveConfig(data, type, firstSave);
    } catch (err) {
      config = err;
    }

    event.sender.send('config-save-response', config);
  });

  ipcMain.on('url-request', async (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('hide-window-request', async () => {
    window.hide();
  });

  ipcMain.on('open-deploy-dialog', async () => {
    dialog.showMessageBox({
      type: 'info',
      detail:
        'For now, the canary channel of Now Desktop does not ' +
        'support deploying. We are working hard to make this possible ' +
        'again. If you need to deploy, please use the stable channel for now.',
      message: 'Temporarily Disabled'
    });
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

  // We need to wait until the window is loaded before assigning the
  // events that are triggered from the main process.
  window.webContents.on('did-finish-load', () => {
    if (process.platform === 'win32') {
      return;
    }

    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        const isEnabled = getDarkModeStatus();
        window.webContents.send('dark-mode-status-changed', isEnabled);
      }
    );
  });

  ipcMain.on('dark-mode-request', async event => {
    const isEnabled = getDarkModeStatus();
    event.sender.send('dark-mode-response', isEnabled);
  });

  ipcMain.on('latest-version-request', async event => {
    const { platform } = process;

    const channel = (await isCanary()) ? 'releases-canary' : 'releases';
    const feedURL = `https://now-desktop-${channel}.zeit.sh/update/${platform}`;
    const currentVersion = app.getVersion();

    const res = await fetch(`${feedURL}/${currentVersion}`);
    const latestVersion = await res.json();

    event.sender.send(
      'latest-version-response',
      latestVersion ? latestVersion.name : null
    );
  });
};
