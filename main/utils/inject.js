// Native
const path = require('path');

// Packages
const fs = require('fs-promise');

// Ours
const deploy = require('../actions/deploy');
const { error: showError } = require('../dialogs');

module.exports = async (tmpDir, defaults) => {
  const pkgPath = path.join(tmpDir, 'package.json');

  try {
    await fs.writeJSON(pkgPath, defaults);
  } catch (err) {
    showError('Could not inject package.json for sharing', err);
    return;
  }

  await deploy(tmpDir, true);
};
