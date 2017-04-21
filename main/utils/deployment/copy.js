// Native
const path = require('path')

// Packages
const deglob = require('deglob')
const fs = require('fs-promise')

// Utilities
const { error: showError } = require('../../dialogs')
const injectPackage = require('./inject')

module.exports = async (content, tmp, defaults) => {
  let items
  const copiers = new Set()

  try {
    items = await new Promise((resolve, reject) => {
      deglob(['**'], (err, files) => {
        if (err) {
          reject(err)
          return
        }

        resolve(files)
      })
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
