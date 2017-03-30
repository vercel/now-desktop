// Native
const path = require('path');
const { spawnSync } = require('child_process');

// Packages
const fetch = require('node-fetch');
const tmp = require('tmp-promise');
const retry = require('async-retry');
const load = require('download');
const fs = require('fs-promise');
const which = require('which-promise');
const sudo = require('sudo-prompt');
const { path: appRootPath, resolve: resolvePath } = require('app-root-path');
const { sync: mkdir } = require('mkdirp');
const Registry = require('winreg');

// Ours
const { error: showError } = require('../dialogs');

// Retruns the path in which the `now` binary should be saved
exports.getPath = () => {
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
  } else if (path.includes(second)) {
    return second;
  }

  return '/usr/bin';
};

const platformName = () => {
  const original = process.platform;
  let name;

  switch (original) {
    case 'win32':
      name = 'Windows';
      break;
    case 'darwin':
      name = 'macOS';
      break;
    default:
      name = original;
  }

  return name;
};

exports.getBinarySuffix = () => process.platform === 'win32' ? '.exe' : '';

exports.getURL = async () => {
  const url = 'https://now-cli-latest.now.sh';

  let response;

  try {
    response = await fetch(url);
  } catch (err) {
    return;
  }

  if (!response.ok) {
    return;
  }

  try {
    response = await response.json();
  } catch (err) {
    showError('Could not parse response as JSON', err);
    return;
  }

  if (!response.assets || response.assets.length < 1) {
    return;
  }

  const forPlatform = response.assets.find(
    asset => asset.platform === platformName()
  );

  if (!forPlatform) {
    return;
  }

  const downloadURL = forPlatform.url;

  if (!downloadURL) {
    showError("Latest release doesn't contain a binary");
    return;
  }

  return {
    url: downloadURL,
    version: response.tag,
    binaryName: forPlatform.name
  };
};

exports.download = async (url, binaryName) => {
  let tempDir;

  try {
    tempDir = await tmp.dir();
  } catch (err) {
    showError('Could not create temporary directory', err);
    return;
  }

  try {
    await retry(async () => {
      await load(url, tempDir.path);
    });
  } catch (err) {
    showError('Could not download binary', err);
    return;
  }

  return {
    path: path.join(tempDir.path, binaryName),
    cleanup: tempDir.cleanup
  };
};

exports.handleExisting = async () => {
  let existing;

  try {
    existing = await which('now', { all: true });
  } catch (err) {
    return;
  }

  // On Windows the now-desktop executable name is `Now.exe`. If we run `where now`
  // = require(inside the app, the first result will be such executable.
  // Because of that, we need to ask `which-promise` to return all the results and then
  // ignore the first one, since it's the app itself
  if (process.platform === 'win32') {
    const first = path.parse(existing[0]);

    if (appRootPath.startsWith(first.dir)) {
      existing.shift();
    }
  }

  // `which-promise` will return an array even on macOS and Linux
  existing = existing.shift();

  if (existing === undefined) {
    return;
  }

  try {
    await fs.remove(existing);
  } catch (err) {
    showError('Not able to remove existing binary', err);
  }
};

exports.setPermissions = async baseDir => {
  let nodePath;

  try {
    nodePath = await which('node');
  } catch (err) {}

  const nowPath = path.join(baseDir, `now${exports.getBinarySuffix()}`);

  if (nodePath) {
    // Get permissions = require(node binary
    const nodeStats = await fs.stat(nodePath);

    if (nodeStats.mode) {
      // And copy them over to ours
      await fs.chmod(nowPath, nodeStats.mode);
    }

    const nowStats = await fs.stat(nowPath);

    if (nowStats.mode === nodeStats.mode) {
      return;
    }
  }

  const sudoOptions = {
    name: 'Now',
    icns: resolvePath('/assets/icons/multi.icns')
  };

  const cmd = 'chmod +x ' + nowPath;

  // Request password = require(user
  return new Promise((resolve, reject) =>
    sudo(cmd, sudoOptions, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stdout);
    }));
};

// Ensures that the `now.exe` directory is on the user's `PATH`
exports.ensurePath = async () => {
  if (process.platform !== 'win32') {
    return;
  }

  const folder = exports.getPath();

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
    }));
};
