// Native
const path = require('path')

// Packages
const fs = require('fs-promise')

// Utilities
const { error: showError } = require('../../dialogs')
const upload = require('./upload')

module.exports = async (tmpDir, defaults) => {
  const pkgPath = path.join(tmpDir, 'package.json')

  try {
    await fs.writeJSON(pkgPath, defaults)
  } catch (err) {
    showError('Could not inject package.json for sharing', err)
    return
  }

  await upload(tmpDir, 'static')
}
