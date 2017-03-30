// Native
const path = require('path');
const { homedir } = require('os');

// Packages
const { autoUpdater } = require('electron');
const ms = require('ms');
const semVer = require('semver');
const fs = require('fs-promise');
const pathType = require('path-type');
const trimWhitespace = require('trim');
const exists = require('path-exists');
const { exec } = require('child-process-promise');

// Ours
const { error: showError } = require('./dialogs');
const notify = require('./notify');
const binaryUtils = require('./utils/binary');

const platform = process.platform === 'darwin' ? 'osx' : process.platform;
const feedURL = 'https://now-auto-updates.now.sh/update/' + platform;

const localBinaryVersion = async () => {
  // We need to modify the `cwd` to prevent the app itself (Now.exe) to be
  // executed on Windows. On other platforms this shouldn't produce side effects.
  const cmd = await exec('now -v', { cwd: homedir() });

  if (!cmd.stdout) {
    throw new Error('Not version tag received from `now -v`');
  }

  // Make version tag parsable
  const output = trimWhitespace(cmd.stdout.toString());

  if (semVer.valid(output)) {
    return output;
  }

  // This is for the old version output
  // Example: "𝚫 now 4.3.0"
  // The new one (handled above) looks like this: "4.3.0"
  return output.split(' ')[2].trim();
};

const updateBinary = async () => {
  if (process.env.CONNECTION === 'offline') {
    return;
  }

  const binaryDir = binaryUtils.getPath();
  const fullPath = path.join(binaryDir, `now${binaryUtils.getBinarySuffix()}`);

  if (!await exists(fullPath) || (await pathType.symlink(fullPath))) {
    return;
  }

  console.log('Checking for binary updates...');

  const currentRemote = await binaryUtils.getURL();
  const currentLocal = await localBinaryVersion();

  // Force an update if "now -v" fails
  if (currentLocal) {
    const comparision = semVer.compare(currentLocal, currentRemote.version);

    if (comparision !== -1) {
      console.log('No updates found for binary');
      return;
    }

    console.log('Found an update for binary! Downloading...');
  }

  const updateFile = await binaryUtils.download(
    currentRemote.url,
    currentRemote.binaryName
  );

  // Move binary update into the place of the old one
  // This step automatically overwrites the existing (old) binary
  await fs.rename(updateFile.path, fullPath);

  // Make sure the binary is executable
  await binaryUtils.setPermissions(binaryDir);

  // Remove temporary directory that contained the update
  updateFile.cleanup();

  // Check the version of the installed binary
  const newVersion = await localBinaryVersion();

  const messages = {
    windows: 'Updated `now.exe` to v' + newVersion,
    macOS: 'Updated `now` to v' + newVersion
  };

  const isWin = process.platform === 'win32';
  const title = isWin ? messages.windows : messages.macOS;

  notify({
    title,
    body: 'Try it in your terminal!'
  });
};

const startBinaryUpdates = () => {
  const binaryUpdateTimer = time =>
    setTimeout(
      async () => {
        try {
          await updateBinary();
          binaryUpdateTimer(ms('10m'));
        } catch (err) {
          console.log(err);
          binaryUpdateTimer(ms('1m'));
        }
      },
      time
    );

  binaryUpdateTimer(ms('2s'));
};

const startAppUpdates = app => {
  autoUpdater.on('error', console.error);

  try {
    autoUpdater.setFeedURL(feedURL + '/' + app.getVersion());
  } catch (err) {
    showError('Auto updated could not set feed URL', err);
  }

  const checkForUpdates = () => {
    if (process.env.CONNECTION === 'offline') {
      return;
    }

    autoUpdater.checkForUpdates();
  };

  // Check for app update after startup
  setTimeout(checkForUpdates, ms('10s'));

  // And then every 5 minutes
  setInterval(checkForUpdates, ms('5m'));

  autoUpdater.on('update-downloaded', () => {
    process.env.UPDATE_STATUS = 'downloaded';

    setInterval(
      () => {
        if (process.env.BUSYNESS !== 'ready') {
          return;
        }

        autoUpdater.quitAndInstall();
        app.quit();
      },
      ms('2s')
    );
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for app updates...');
  });

  autoUpdater.on('update-available', () => {
    console.log('Found update for the app! Downloading...');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates found for the app');
  });
};

module.exports = app => {
  startBinaryUpdates();
  startAppUpdates(app);
};
