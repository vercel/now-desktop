const path = require('path');
const { homedir } = require('os');
const { systemPreferences, app } = require('electron');
const fs = require('fs-extra');
const groom = require('groom');
const deepExtend = require('deep-extend');

const paths = {
  auth: '.now/auth.json',
  config: '.now/config.json'
};

const { platform } = process;
const isWindows = platform === 'win32';
const isMacOS = platform === 'darwin';

for (const file in paths) {
  if (!{}.hasOwnProperty.call(paths, file)) {
    continue;
  }

  paths[file] = path.join(homedir(), paths[file]);
}

const assignUpdate = (...parts) =>
  Object.assign({}, ...parts, {
    lastUpdate: Date.now()
  });

exports.getConfig = async () => {
  try {
    const authContent = await fs.readJSON(paths.auth);
    const config = await fs.readJSON(paths.config);

    let token = null;

    if (authContent) {
      token = authContent.token;
    }

    return assignUpdate(config || {}, { token });
  } catch (error) {
    if (error.code === 'ENOENT') {
      const newConfig = {};
      if (app.getVersion().includes('canary')) {
        newConfig.updateChannel = 'canary';
      }

      await exports.saveConfig(newConfig, 'config');
      await exports.saveConfig({}, 'auth');

      return {};
    }

    throw error;
  }
};

exports.removeConfig = async () => {
  const configContent = await fs.readJSON(paths.config);

  delete configContent.currentTeam;

  await fs.writeJSON(paths.config, configContent, {
    spaces: 2
  });

  const authContent = await fs.readJSON(paths.auth);
  const comment = authContent._ ? `${authContent._}` : null;
  const newAuthContent = {};

  if (comment) {
    newAuthContent._ = comment;
  }

  await fs.writeJSON(paths.auth, newAuthContent, {
    spaces: 2
  });
};

exports.saveConfig = async (data, type) => {
  const destination = paths[type];
  let currentContent = {};

  try {
    currentContent = await fs.readJSON(destination);
  } catch (error) {}

  if (type === 'config') {
    const existingShownTips = currentContent.shownTips;

    if (existingShownTips) {
      // Make sure tips don't show up again if they
      // were hidden with the old config
      data = deepExtend(data, {
        desktop: {
          shownTips: existingShownTips
        }
      });

      delete currentContent.shownTips;

      if (currentContent.sh) {
        delete currentContent.sh.shownTips;
      }
    }

    if (typeof data.user !== 'undefined') {
      delete data.user;
    }

    if (data.currentTeam !== null && typeof data.currentTeam === 'object') {
      data.currentTeam = data.currentTeam.id;
    }

    if (!currentContent._) {
      currentContent._ =
        'This is your Now config file. See `now config help`. More: https://git.io/v5ECz';
      currentContent.updateChannel = 'stable';
    }

    // Merge new data with the existing
    currentContent = deepExtend(currentContent, data);

    // Remove all the data that should be removed (like `null` props)
    currentContent = groom(currentContent);

    // And ensure that empty objects are also gone
    for (const newProp in data) {
      if (!{}.hasOwnProperty.call(data, newProp)) {
        continue;
      }

      const propContent = currentContent[newProp];
      const isObject = typeof propContent === 'object';

      // Ensure that there are no empty objects inside the config
      if (isObject && Object.keys(propContent).length === 0) {
        delete currentContent[newProp];
      }
    }
  } else if (type === 'auth') {
    if (!currentContent._) {
      currentContent._ =
        "This is your Now credentials file. DON'T SHARE! More: https://git.io/v5ECz";
    }

    Object.assign(currentContent, data);
  }

  // Create all the directories
  await fs.ensureFile(destination);

  // Update config file
  await fs.writeJSON(destination, currentContent, {
    spaces: 2
  });

  return assignUpdate(currentContent);
};

exports.getDarkModeStatus = () => {
  // The components in the renderer only allows boolean as the
  // type for the property that decides whether the
  // dark mode is enabled, so we cannot default to `null`.
  let isEnabled = false;

  if (isMacOS) {
    isEnabled = systemPreferences.isDarkMode();
  } else if (isWindows) {
    isEnabled = systemPreferences.isInvertedColorScheme();
  }

  return isEnabled;
};
