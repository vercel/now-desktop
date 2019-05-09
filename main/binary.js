const path = require('path');
const { spawnSync } = require('child_process');
const { homedir } = require('os');
const { createGunzip } = require('zlib');
const { ipcMain, dialog } = require('electron');
const fetch = require('node-fetch');
const tmp = require('tmp-promise');
const fs = require('fs-extra');
const { sync: mkdir } = require('mkdirp');
const Registry = require('winreg');
const globalPackages = require('global-packages');
const { exec } = require('child-process-promise');
const semVer = require('semver');
const trimWhitespace = require('trim');
const pipe = require('promisepipe');
const exists = require('path-exists');
const retry = require('async-retry');
const sudo = require('sudo-prompt');
const { resolve: resolvePath } = require('app-root-path');
const notify = require('./notify');
const { saveConfig, getConfig } = require('./config');

// Ensures that the `now.exe` directory is on the user's `PATH`
const ensurePath = async () => {
  if (process.platform !== 'win32') {
    return;
  }

  const folder = exports.getDirectory();

  const regKey = new Registry({
    hive: Registry.HKCU,
    key: '\\Environment'
  });

  return new Promise((resolve, reject) =>
    regKey.values((err, items) => {
      if (err) {
        reject(err);
        return;
      }

      const pathEntry = items.find(
        item => String(item.name).toLowerCase() === 'path'
      );

      if (pathEntry === undefined) {
        reject(new Error('Could not find `Path` entry in the Registry'));
        return;
      }

      // We don't want to insert the directory into the PATH if it's already there
      if (pathEntry.value.includes(folder)) {
        resolve();
        return;
      }

      regKey.set(
        pathEntry.name,
        pathEntry.type,
        `${pathEntry.value};${folder}`,
        err => {
          if (err) {
            reject(err);
            return;
          }

          // Here we use a very clever hack that was developed by igorklopov:
          // When we edit the `PATH` var in the registry, the `explorer.exe` will
          // not be notified of such change. That sid, when we tell the user
          // to try `now` = require(the command line, it'll not work – `explorer.exe`
          // will pass an old PATH value to the `cmd.exe`. To _fix_ that, we use
          //  the `setx` command to set a temporary empty env var. Such command will
          // broadcast all env vars to `explorer.exe` and _fix_ our problem – the
          // user will now be able to use `now` in the command line right after
          // the installation.
          spawnSync('setx', ['NOW_ENSURE_PATH_TMP', '""']);

          // Here we remove the temporary env var = require(the registry
          regKey.remove('NOW_ENSURE_PATH_TMP', () => resolve());
        }
      );
    })
  );
};

const runAsRoot = (command, why) => {
  const isWin = process.platform === 'win32';
  const buttons = ['OK', 'Cancel'];

  if (isWin) {
    buttons.reverse();
  }

  const answer = dialog.showMessageBox({
    type: 'question',
    message: 'Now Needs More Permissions',
    detail: why,
    buttons
  });

  // The order of options is different on Windows
  if (answer === (isWin ? 0 : 1)) {
    throw new Error('No permissions given');
  }

  return new Promise((resolve, reject) => {
    const options = {
      name: 'Now',
      icns: resolvePath('./main/static/icons/mac.icns')
    };

    sudo.exec(command, options, error => {
      if (error) {
        return reject(error);
      }

      resolve();
    });
  });
};

// Change the permissions of the `now` binary, so
// that the user can execute it
const setPermissions = async target => {
  if (process.platform === 'win32') {
    return;
  }

  const nowPath = target || exports.getFile();
  const mode = '0755';
  const stat = await fs.stat(nowPath);
  const current = '0' + (stat.mode & 511).toString(8);

  // If the existing mode matches the one we
  // want to set, we don't need to do anything.

  // This is very important, because it avoids
  // multiple dialog prompts.
  if (current === mode) {
    return;
  }

  try {
    await fs.chmod(nowPath, mode);
  } catch (err) {
    const command = `chmod ${mode} ${nowPath}`;
    const why = 'To make Now CLI executable.';

    await runAsRoot(command, why);
  }
};

const platformName = () => {
  const original = process.platform;
  let name;

  switch (original) {
    case 'darwin':
      name = 'now-macos';
      break;
    case 'win32':
      name = 'now-win.exe';
      break;
    default:
      name = original;
  }

  return `${name}.gz`;
};

const canaryCheck = async () => {
  const config = await getConfig();

  const { updateChannel } = config;
  return updateChannel && updateChannel === 'canary';
};

const disableUpdateCLI = async () => {
  const configUpdate = {
    desktop: {
      updateCLI: false
    }
  };

  saveConfig(configUpdate, 'config');
};

const installedWithNPM = async () => {
  let packages;

  try {
    packages = await globalPackages();
  } catch (err) {
    console.log(err);
    return false;
  }

  if (!Array.isArray(packages)) {
    return false;
  }

  const related = packages.find(item => item.name === 'now');

  if (!related || related.linked === true) {
    return false;
  }

  if (related.linked === false) {
    return true;
  }

  return false;
};

const notifySuccessfulInstall = () => {
  notify({
    title: 'Finished Installing Now CLI',
    body: 'You can now use `now` from the command line.'
  });
};

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '');

// Returns the path in which the `now` binary should be saved
exports.getDirectory = () => {
  if (process.platform === 'win32') {
    const path = `${process.env.LOCALAPPDATA}\\now-cli`;
    mkdir(path);
    return path;
  }

  const path = process.env.PATH.split(':');
  const first = path.join(process.env.HOME, 'bin');
  const second = '/usr/local/bin';

  if (path.includes(first)) {
    return first;
  }

  if (path.includes(second)) {
    return second;
  }

  return '/usr/bin';
};

exports.getFile = () => {
  const destDirectory = exports.getDirectory();
  const suffix = getBinarySuffix();

  return path.join(destDirectory, 'now' + suffix);
};

exports.handleExisting = async next => {
  const destFile = exports.getFile();
  const parent = path.dirname(destFile);
  const isWin = process.platform === 'win32';

  const copyPrefix = isWin ? 'copy /b/v/y' : 'cp -p';
  const copyCommand = `${copyPrefix} ${next} ${destFile}`;

  const why = 'To place Now CLI in the correct location.';

  try {
    await fs.ensureDir(parent);
  } catch (err) {
    const dirCommand = `${isWin ? 'md' : 'mkdir -p'} ${parent}`;
    const commands = [dirCommand, copyCommand];

    if (!isWin) {
      commands.splice(1, 0, `chown -R \`whoami\` ${parent}`);
    }

    await runAsRoot(commands.join(' && '), why);

    await setPermissions();
    await ensurePath();

    return;
  }

  try {
    // We don't use the programmatic Node API here
    // because we want to allow the `-p` flag.
    await exec(copyCommand);
  } catch (err) {
    await runAsRoot(copyCommand, why);
  }

  await setPermissions();
  await ensurePath();
};

exports.getURL = async () => {
  const url = 'https://now-cli-releases.zeit.sh';
  const response = await fetch(url, {
    headers: {
      'user-agent': 'test'
    }
  });

  if (!response.ok) {
    throw new Error('Binary response not okay');
  }

  const isCanary = await canaryCheck();
  const releases = await response.json();
  const release = isCanary ? releases.canary : releases.stable;

  if (!release || !release.assets || release.assets.length === 0) {
    throw new Error('Not able to get URL of latest binary');
  }

  const forPlatform = release.assets.find(
    asset => asset.name === platformName()
  );

  if (!forPlatform) {
    throw new Error('Not able to select platform of latest binary');
  }

  const downloadURL = forPlatform.url;

  if (!downloadURL) {
    throw new Error("Latest release doesn't contain a binary");
  }

  return {
    url: downloadURL,
    version: release.tag,
    binaryName: forPlatform.name
  };
};

exports.testBinary = async which => {
  // Make it executable first
  await setPermissions(which);

  // And then try to get the version
  // To see if the binary is even working
  const cmd = await retry(
    () => {
      const cwd = homedir();
      return exec(`${which} -v`, { cwd });
    },
    {
      retries: 5,
      factor: 1
    }
  );

  if (cmd.stdout) {
    const output = trimWhitespace(cmd.stdout.toString());

    if (semVer.valid(output)) {
      return;
    }
  }

  throw new Error(`The downloaded binary doesn't work`);
};

exports.download = async (url, binaryName) => {
  const tempDir = await tmp.dir({
    unsafeCleanup: true
  });

  ipcMain.once('online-status-changed', (event, status) => {
    if (status === 'offline') {
      const error = new Error('You went offline! Stopping download...');
      error.name = 'offline';

      throw error;
    }
  });

  const binaryDownload = await fetch(url, {
    headers: {
      'user-agent': 'test'
    },
    compress: false
  });

  const { body } = binaryDownload;

  const destination = path.join(tempDir.path, binaryName);
  const writeStream = fs.createWriteStream(destination);
  const encoding = binaryDownload.headers.get('content-encoding');
  const extension = path.extname(url);
  const isCompressed = encoding === 'gzip' || extension === '.gz';

  if (isCompressed) {
    const gunzip = createGunzip();
    await pipe(body, gunzip, writeStream);
  } else {
    await pipe(body, writeStream);
  }

  return {
    path: path.join(tempDir.path, binaryName),
    cleanup: tempDir.cleanup
  };
};

exports.installBundleTemp = async () => {
  const downloadURL = await exports.getURL();
  let tempLocation;

  ipcMain.once('complete-installation', async (e, checked) => {
    if (tempLocation) {
      if (checked) {
        try {
          await exports.testBinary(tempLocation.path);
        } catch (err) {
          await tempLocation.cleanup();
          throw err;
        }

        try {
          await exports.handleExisting(tempLocation.path);
        } catch (err) {
          console.error(err);
          throw new Error('Not able to move binary');
        }

        notifySuccessfulInstall();
        tempLocation.cleanup();
      } else {
        await disableUpdateCLI();
        tempLocation.cleanup();
      }
    } else if (checked) {
      // This is needed if the download took time and the event was triggered before download could complete.
      await exports.install();
    } else {
      await disableUpdateCLI();
    }
  });

  try {
    tempLocation = await exports.download(
      downloadURL.url,
      downloadURL.binaryName
    );
  } catch (err) {
    if (err instanceof Error && err.name && err.name === 'offline') {
      throw new Error(err.message);
    }
    throw new Error('Could not download binary');
  }
};

exports.isInstalled = async () => {
  const fullPath = exports.getFile();
  const isInstalled = (await exists(fullPath)) || (await installedWithNPM());

  return isInstalled;
};

exports.install = async () => {
  if (await exports.isInstalled()) {
    return;
  }

  const downloadURL = await exports.getURL();
  let tempLocation;

  try {
    tempLocation = await exports.download(
      downloadURL.url,
      downloadURL.binaryName
    );
  } catch (err) {
    if (err instanceof Error && err.name && err.name === 'offline') {
      throw new Error(err.message);
    }
    throw new Error('Could not download binary');
  }

  try {
    await exports.testBinary(tempLocation.path);
  } catch (err) {
    await tempLocation.cleanup();
    throw err;
  }

  try {
    await exports.handleExisting(tempLocation.path);
  } catch (err) {
    console.error(err);
    throw new Error('Not able to move binary');
  }

  notifySuccessfulInstall();
  tempLocation.cleanup();
};
