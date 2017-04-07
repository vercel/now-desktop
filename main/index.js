if (require('electron-squirrel-startup')) {
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit();
}

// Native
const path = require('path');

// Packages
const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const ms = require('ms');
const isDev = require('electron-is-dev');
const { dir: isDirectory } = require('path-type');
const fs = require('fs-promise');
const fixPath = require('fix-path');
const { resolve: resolvePath } = require('app-root-path');
const firstRun = require('first-run');
const { moveToApplications } = require('electron-lets-move');

// Utilities
const { innerMenu, outerMenu, deploymentOptions } = require('./menu');
const { error: showError } = require('./dialogs');
const deploy = require('./actions/deploy');
const share = require('./actions/share');
const autoUpdater = require('./updates');
const { prepareCache, refreshCache } = require('./api');
const attachTrayState = require('./utils/highlight');
const toggleWindow = require('./utils/toggle-window');
const server = require('./server');
const { get: getConfig } = require('./utils/config');

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null;

// Set the application's name
app.setName('Now');

// Hide dock icon before the app starts
if (process.platform === 'darwin') {
  app.dock.hide();
}

// Make Now start automatically on login
if (!isDev && firstRun()) {
  app.setLoginItemSettings({
    openAtLogin: true
  });
}

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath();

// Keep track of the app's busyness for telling
// the autoupdater if it can restart the application
process.env.BUSYNESS = 'ready';

// Make sure that unhandled errors get handled
process.on('uncaughtException', err => {
  console.error(err);
  showError('Unhandled error appeared', err);
});

const cache = prepareCache();

// For starting the refreshment right after login
global.startRefresh = async tutorialWindow => {
  const timeSpan = ms('10s');

  // Refresh cache once in the beginning
  await refreshCache(null, app, tutorialWindow);

  // After that, oeriodically refresh it every 10 seconds
  const interval = setInterval(
    async () => {
      if (process.env.CONNECTION === 'offline') {
        return;
      }

      await refreshCache(null, app, tutorialWindow, interval);
    },
    timeSpan
  );
};

const windowURL = page => `next://app/${page}`;

const onboarding = () => {
  const win = new BrowserWindow({
    width: 650,
    height: 430,
    title: 'Welcome to Now',
    resizable: false,
    center: true,
    frame: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#000'
  });

  win.loadURL(windowURL('tutorial'));
  attachTrayState(win, tray);

  // We need to access it = the "About" window
  // To be able to open it = there
  global.tutorial = win;

  const emitTrayClick = aboutWindow => {
    const emitClick = () => {
      if (aboutWindow && aboutWindow.isVisible()) {
        return;
      }

      // Automatically open the context menu
      if (tray) {
        tray.emit('click');
      }

      win.removeListener('hide', emitClick);
    };

    win.on('hide', emitClick);
    win.hide();
  };

  win.on('open-tray', emitTrayClick);

  // Just hand it back
  return win;
};

const aboutWindow = () => {
  const win = new BrowserWindow({
    width: 360,
    height: 408,
    title: 'About Now',
    resizable: false,
    center: true,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: 'hidden-inset',
    frame: false,
    backgroundColor: '#ECECEC'
  });

  win.loadURL(windowURL('about'));
  attachTrayState(win, tray);

  global.about = win;

  return win;
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const assignAliases = (aliases, deployment) => {
  if (aliases) {
    const aliasInfo = aliases.find(a => deployment.uid === a.deploymentId);

    if (aliasInfo) {
      deployment.url = aliasInfo.alias;
    }
  }

  return deploymentOptions(deployment);
};

// Convert date string = API to valid date object
const toDate = int => new Date(parseInt(int, 10));

const toggleContextMenu = async windows => {
  const deployments = cache.get('deployments');
  const aliases = cache.get('aliases');

  const apps = new Map();
  const deploymentList = [];

  // Order deployments by date
  deployments.sort((a, b) => toDate(b.created) - toDate(a.created));

  for (const deployment of deployments) {
    const name = deployment.name;

    if (apps.has(name)) {
      const existingDeployments = apps.get(name);
      apps.set(name, [...existingDeployments, deployment]);

      continue;
    }

    apps.set(name, [deployment]);
  }

  apps.forEach((deployments, label) => {
    if (deployments.length === 1) {
      deploymentList.push(assignAliases(aliases, deployments[0]));
      return;
    }

    deploymentList.push({
      type: 'separator'
    });

    deploymentList.push({
      label,
      enabled: false
    });

    for (const deployment of deployments) {
      deploymentList.push(assignAliases(aliases, deployment));
    }

    deploymentList.push({
      type: 'separator'
    });
  });

  const data = {
    deployments: deploymentList
  };

  let generatedMenu = await innerMenu(app, tray, data, windows);

  if (process.env.CONNECTION === 'offline') {
    const last = generatedMenu.slice(-1)[0];

    generatedMenu = [
      {
        label: "You're offline!",
        enabled: false
      },
      {
        type: 'separator'
      }
    ];

    generatedMenu.push(last);
  }

  const menu = Menu.buildFromTemplate(generatedMenu);
  tray.popUpContextMenu(menu, tray.getBounds());
};

const isLoggedIn = async () => {
  try {
    await getConfig();
  } catch (err) {
    return false;
  }

  return true;
};

const isDeployable = async directory => {
  const indicators = new Set(['package.json', 'Dockerfile']);

  for (const indicator of indicators) {
    const pathTo = path.join(directory, indicator);
    let stats;

    try {
      stats = fs.lstatSync(pathTo);
    } catch (err) {}

    if (stats) {
      return true;
    }
  }

  return false;
};

const fileDropped = async (event, files) => {
  event.preventDefault();

  if (process.env.CONNECTION === 'offline') {
    showError("You're offline");
    return;
  }

  if (!await isLoggedIn()) {
    return;
  }

  if (files.length > 1) {
    showError(
      "It's not yet possible to share multiple files/directories at once."
    );
    return;
  }

  const item = files[0];

  if (!await isDirectory(item) || !await isDeployable(item)) {
    await share(item);
    return;
  }

  await deploy(item);
};

app.on('ready', async () => {
  if (!cache.has('no-move-wanted') && !isDev) {
    try {
      const moved = await moveToApplications();

      if (!moved) {
        cache.set('no-move-wanted', true);
      }
    } catch (err) {
      showError(err);
    }
  }

  const onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false
  });

  onlineStatusWindow.loadURL(
    'file://' + resolvePath('./main/static/pages/status.html')
  );

  ipcMain.on('online-status-changed', (event, status) => {
    process.env.CONNECTION = status;
  });

  // Provide application and the CLI with automatic updates
  autoUpdater();

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do

  // I have no idea why, but path.resolve doesn't work here
  try {
    const iconName = process.platform === 'win32'
      ? 'iconWhite'
      : 'iconTemplate';
    tray = new Tray(resolvePath(`./main/static/tray/${iconName}.png`));

    // Opening the context menu after login should work
    global.tray = tray;
  } catch (err) {
    showError('Could not spawn tray item', err);
    return;
  }

  try {
    await server();
  } catch (err) {
    showError('Not able to start server', err);
    return;
  }

  const windows = {
    tutorial: onboarding(),
    about: aboutWindow()
  };

  const toggleActivity = async event => {
    const loggedIn = await isLoggedIn();

    if (loggedIn && !windows.tutorial.isVisible()) {
      tray.setHighlightMode('selection');
      toggleContextMenu(windows);
    } else {
      toggleWindow(event || null, windows.tutorial);
    }
  };

  // Only allow one instance of Now running
  // at the same time
  const shouldQuit = app.makeSingleInstance(toggleActivity);

  if (shouldQuit) {
    // We're using `exit` because `quit` didn't work
    // on Windows (tested by matheuss)
    return app.exit();
  }

  // If the user is logged in and the app isn't running
  // the first time, immediately start refreshing the data

  // Otherwise, ask the user to log in using the tutorial
  if ((await isLoggedIn()) && !firstRun()) {
    // Periodically rebuild local cache every 10 seconds
    await global.startRefresh(windows.tutorial);
  } else {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    windows.tutorial.on('ready-to-show', () =>
      toggleWindow(null, windows.tutorial));
  }

  // When quitting the app, force close the tutorial and about windows
  app.on('before-quit', () => {
    process.env.FORCE_CLOSE = true;
  });

  // Define major event listeners for tray
  tray.on('drop-files', fileDropped);
  tray.on('click', toggleActivity);

  let isHighlighted = false;
  let submenuShown = false;

  tray.on('right-click', async event => {
    const menu = Menu.buildFromTemplate(outerMenu(app, windows));

    if (!windows.tutorial.isVisible()) {
      isHighlighted = !isHighlighted;
      tray.setHighlightMode(isHighlighted ? 'always' : 'never');
    }

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu);
    submenuShown = !submenuShown;

    event.preventDefault();
  });
});
