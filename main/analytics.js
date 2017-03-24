// Native
const os = require('os');

// Packages
const macAddress = require('macaddress');
const md5 = require('md5');
const mixpanel = require('mixpanel');
const fileSize = require('filesize');
const firstRun = require('first-run');
const Config = require('electron-config');
const isDev = require('electron-is-dev');

// Ours
const pkg = require('../app/package');

const getMacAddress = () =>
  new Promise((resolve, reject) => {
    // Get unique identifier for the current system
    macAddress.one((err, mac) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(mac);
    });
  });

const getEmailAddress = () => {
  const config = new Config();
  const identifier = 'now.user.email';

  if (!config.has(identifier)) {
    return false;
  }

  return config.get(identifier);
};

const analytics = mixpanel.init(pkg.mixPanel.id, {
  protocol: 'https'
});

exports.track = (handle, details = {}) => {
  if (!handle || isDev || process.env.TESTING) {
    return;
  }

  if (!process.env.MACHINE) {
    return;
  }

  // Identify session
  // XO doesn't allow properties that aren't camelcased
  const distinctID = 'distinct_id';
  details[distinctID] = process.env.MACHINE;

  // Send event to MixPanel
  analytics.track(handle, details);
};

exports.init = async () => {
  if (isDev) {
    return;
  }

  const email = getEmailAddress();
  let identifier;

  if (email) {
    identifier = email;
  } else {
    try {
      identifier = await getMacAddress();
    } catch (err) {
      return;
    }
  }

  // Generate unique identifier for user
  process.env.MACHINE = md5(identifier);

  // Create new user in Mixpanel
  analytics.people.set(process.env.MACHINE, {
    Platform: os.type(),
    Memory: fileSize(os.totalmem()),
    Arch: os.arch()
  });

  if (firstRun()) {
    exports.track('App installed', {
      Version: pkg.version
    });
  }

  exports.track('App booted');
};
