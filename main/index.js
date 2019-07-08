const electron = require('electron');
const isDev = require('electron-is-dev');
const fixPath = require('fix-path');
const prepareNext = require('electron-next');
const { resolve: resolvePath } = require('app-root-path');
const squirrelStartup = require('electron-squirrel-startup');
const Sentry = require('@sentry/electron');
const { sentryDsn } = require('../package');
const firstRun = require('./first-run');
const { getMainMenu } = require('./menu');
const autoUpdater = require('./updates');
const { getWindow, toggleWindow } = require('./window');
const prepareIpc = require('./ipc');
const { getConfig } = require('./config');

Sentry.init({
  dsn: sentryDsn
});

// Immediately quit the app if squirrel is launching it
if (squirrelStartup) {
  electron.app.quit();
}

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null;

// Load the app instance from electron
const { app } = electron;

// Set the application's name
app.name = 'Now';

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error(error);

  Sentry.captureException(error);

  electron.dialog.showMessageBox({
    title: 'Unexpected Error',
    type: 'error',
    message: 'An Error Has Occurred',
    detail: error.toString(),
    buttons: ['Quit Now']
  });

  process.exit(1);
});

process.on('unhandledRejection', error => {
  console.error(error);

  Sentry.captureException(error);

  electron.dialog.showMessageBox({
    title: 'Unexpected Error',
    type: 'error',
    message: 'An Error Has Occurred',
    detail: error.toString(),
    buttons: ['Quit Now']
  });

  process.exit(1);
});

// Hide dock icon before the app starts
// This is only required for development because
// we're setting a property on the bundled app
// in production, which prevents the icon from flickering
if (isDev && process.platform === 'darwin') {
  app.dock.hide();
}

const isFirstRun = firstRun();

// Make Now start automatically on login
if (!isDev && isFirstRun) {
  app.setLoginItemSettings({
    openAtLogin: true
  });
}

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Chrome Command Line Switches
app.commandLine.appendSwitch('disable-renderer-backgrounding');

app.on('ready', async () => {
  try {
    const iconName =
      process.platform === 'win32'
        ? 'iconWhite'
        : process.platform === 'linux'
        ? 'iconWhite'
        : 'iconTemplate';
    tray = new electron.Tray(resolvePath(`./main/static/tray/${iconName}.png`));
  } catch (error) {
    return;
  }

  // Opening the context menu after login should work
  global.tray = tray;

  // Ensure that `next` works with `electron`
  try {
    await prepareNext('./renderer');
  } catch (error) {
    // Next has failed to start but context menu should still work
  }

  const config = await getConfig();

  // Generate the browser window
  const window = getWindow(tray, config);

  // Provide application and the CLI with automatic updates
  autoUpdater(window);

  // Make the main process listen to requests from the renderer process
  prepareIpc(app, tray, window);

  const toggleActivity = () => toggleWindow(tray, window);
  const { wasOpenedAtLogin } = app.getLoginItemSettings();

  const afterUpdate = config.desktop && config.desktop.updatedFrom;

  // Only allow one instance of Now running
  // at the same time
  const gotInstanceLock = app.requestSingleInstanceLock();

  if (!gotInstanceLock) {
    // We're using `exit` because `quit` didn't work
    // on Windows (tested by matheus)
    return app.exit();
  }

  app.on('second-instance', toggleActivity);

  if (isFirstRun) {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    if (!wasOpenedAtLogin && !afterUpdate) {
      window.once('ready-to-show', toggleActivity);
    }
  } else if (!window.isVisible() && !wasOpenedAtLogin && !afterUpdate) {
    window.once('ready-to-show', toggleActivity);
  }

  // Linux requires setContextMenu to be called in order for the context menu to populate correctly
  if (process.platform === 'linux') {
    tray.setContextMenu(await getMainMenu(app, tray, window));
  }

  // Define major event listeners for tray
  tray.on('click', toggleActivity);
  tray.on('double-click', toggleActivity);

  let submenuShown = false;

  tray.on('right-click', async event => {
    if (window.isVisible()) {
      window.hide();
      return;
    }

    const menu = await getMainMenu(app, tray, window);

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu);
    submenuShown = !submenuShown;

    event.preventDefault();
  });

  tray.on('drag-enter', () => {
    window.show();
    window.webContents.send('open-dropzone');
  });

  tray.on('drop-files', (_, files) => {
    window.webContents.send('tray-drop', files.length === 1 ? files[0] : files);
  });
});
