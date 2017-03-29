// Native
const path = require('path');
const { execSync: exec } = require('child_process');
const { homedir } = require('os');

// Packages
const { autoUpdater } = require('electron');
const ms = require('ms');
const semVer = require('semver');
const fs = require('fs-promise');
const log = require('electron-log');
const pathType = require('path-type');
const trimWhitespace = require('trim');
const exists = require('path-exists');

// Ours
const { error: showError } = require('./dialogs');
const notify = require('./notify');
const binaryUtils = require('./utils/binary');
const { track } = require('./analytics');

const platform = process.platform === 'darwin' ? 'osx' : process.platform;
const feedURL = 'https://now-auto-updates.now.sh/update/' + platform;

const localBinaryVersion = () => {
  let cmd;

  try {
    // We need to modify the `cwd` to prevent the app itself (Now.exe) to be
    // executed on Windows. On other platforms this shouldn't produce side effects.
    cmd = exec('now -v', { cwd: homedir() }).toString();
  } catch (err) {
    return false;
  }

  // Make version tag parsable
  cmd = trimWhitespace(cmd);

  if (semVer.valid(cmd)) {
    return cmd;
  }

  // This is for the old version output
  // Example: "𝚫 now 4.3.0"
  // The new one (handled above) looks like this: "4.3.0"
  return cmd.split(' ')[2].trim();
};

const stopBinaryUpdate = reason => {
  process.env.BINARY_UPDATE_RUNNING = 'no';
  console.log(reason);
};

const updateBinary = async () => {
  const binaryDir = binaryUtils.getPath();
  const fullPath = path.join(binaryDir, `now${binaryUtils.getBinarySuffix()}`);

  if (!await exists(fullPath) || (await pathType.symlink(fullPath))) {
    return;
  }

  if (process.env.BINARY_UPDATE_RUNNING === 'yes') {
    return;
  }

  process.env.BINARY_UPDATE_RUNNING = 'yes';
  console.log('Checking for binary updates...');

  const currentRemote = await binaryUtils.getURL();
  const currentLocal = localBinaryVersion();

  // Force an update if "now -v" fails
  if (currentLocal) {
    const comparision = semVer.compare(currentLocal, currentRemote.version);

    if (comparision !== -1) {
      return stopBinaryUpdate('No updates found for binary');
    }

    console.log('Found an update for binary! Downloading...');
  }

  let updateFile;

  try {
    updateFile = await binaryUtils.download(
      currentRemote.url,
      currentRemote.binaryName
    );
  } catch (err) {
    return stopBinaryUpdate('Could not download update for binary');
  }

  try {
    await fs.remove(fullPath);
  } catch (err) {
    return stopBinaryUpdate(err);
  }

  try {
    await fs.rename(updateFile.path, fullPath);
  } catch (err) {
    return stopBinaryUpdate(err);
  }

  // Make the binary executable
  try {
    await binaryUtils.setPermissions(binaryDir);
  } catch (err) {
    return stopBinaryUpdate(err);
  }

  updateFile.cleanup();
  process.env.BINARY_UPDATE_RUNNING = 'no';

  const newVersion = localBinaryVersion();

  // If the CLI is broken (not runnable)
  // We need to update again
  if (!newVersion) {
    return stopBinaryUpdate('Binary not executable');
  }

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

  track('Updated binary', {
    'To Version': currentRemote.version
  });
};

module.exports = app => {
  setInterval(
    async () => {
      if (process.env.CONNECTION === 'offline') {
        return;
      }

      try {
        await updateBinary();
      } catch (err) {
        process.env.BINARY_UPDATE_RUNNING = 'no';
      }
    },
    ms('15m')
  );

  autoUpdater.on('error', err => {
    console.error(err);
    log.info(err);
  });

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

  // Check once in the beginning
  setTimeout(
    async () => {
      // Update the app itself
      checkForUpdates();

      // ...and the binary
      try {
        await updateBinary();
      } catch (err) {
        process.env.BINARY_UPDATE_RUNNING = 'no';
      }
    },
    ms('10s')
  );

  // And then every 5 minutes
  setInterval(checkForUpdates, ms('5m'));

  autoUpdater.on('update-downloaded', () => {
    process.env.UPDATE_STATUS = 'downloaded';
    log.info('Downloaded update');

    track('Downloaded update');

    setInterval(
      () => {
        if (process.env.BUSYNESS !== 'ready') {
          return;
        }

        log.info('Installing update');
        track('Installing update');

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
