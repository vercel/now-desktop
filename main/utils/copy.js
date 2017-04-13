// Native
const path = require('path')

// Packages
const glob = require('glob-promise')
const fs = require('fs-promise')

// Ours
const { error: showError } = require('../dialogs')
const injectPackage = require('./inject')

module.exports = async (content, tmp, defaults) => {
  let items
  const copiers = new Set()

  try {
    items = await glob(path.join(content, '**'), {
      dot: true,
      strict: true,
      mark: true,
      ignore: ['**/node_modules/**', '**/.git/**']
    })
  } catch (err) {
    showError('Not able to walk directory for copying it', err)
    return
  }

  // The first item of the glob is the directory itself and we don't want to copy it.
  // Besides that, it causes a weird `operation not permited` error on Windows.
  items.shift()

  for (const item of items) {
    const target = path.join(tmp + '/content', path.relative(content, item))
    copiers.add(fs.copy(item, target))
  }

  try {
    await Promise.all(copiers)
  } catch (err) {}

  await injectPackage(tmp, defaults)
}
