// Native
const path = require('path');

// Packages
const toId = require('to-id');
const fs = require('fs-promise');
const tmp = require('tmp-promise');
const retry = require('async-retry');
const chalk = require('chalk');
const pathExists = require('path-exists');

// Ours
const injectPackage = require('../utils/inject');
const copyContents = require('../utils/copy');
const { error: showError } = require('../dialogs');

module.exports = async item => {
  if (!await pathExists(item)) {
    showError(`Path doesn't exist!`);
    return;
  }

  process.env.BUSYNESS = 'sharing';
  const itemName = path.parse(item).name;

  const pkgDefaults = {
    name: toId(itemName),
    scripts: {
      start: 'serve ./content'
    },
    dependencies: {
      serve: '3.2.7'
    }
  };

  const tmpDir = await retry(
    async () => {
      return tmp.dir({
        prefix: 'now-desktop-',

        // Keep it, because we'll remove it manually later
        keep: true
      });
    },
    {
      retries: 5
    }
  );

  // Log status of deployment
  console.log(chalk.grey('---'));
  console.log(
    chalk.yellow(`[${pkgDefaults.name}]`) +
      ' Created temporary directory for sharing'
  );

  const details = await fs.lstat(item);

  if (details.isDirectory()) {
    await copyContents(item, tmpDir.path, pkgDefaults);
  } else if (details.isFile()) {
    const fileName = path.parse(item).base;
    const target = path.join(tmpDir.path, '/content', fileName);

    try {
      await fs.copy(item, target);
    } catch (err) {
      showError('Not able to copy file to temporary directory', err);
      return;
    }

    await injectPackage(tmpDir.path, pkgDefaults);
  } else {
    showError('Path is neither a file nor a directory!');
  }
};
