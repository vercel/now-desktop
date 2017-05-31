// Native
const path = require('path')
const { homedir } = require('os')

// Packages
const fs = require('fs-extra')
const pathExists = require('path-exists')

// Path to config file
const file = path.join(homedir(), '.now.json')

exports.get = async onlyCheckToken => {
  if (!await pathExists(file)) {
    throw new Error(`Could retrieve config file, it doesn't exist`)
  }

  const content = await fs.readJSON(file)

  if (!content.token) {
    throw new Error('No token contained inside config file')
  }

  if (!onlyCheckToken && !content.user) {
    throw new Error('No user contained inside config file')
  }

  return content
}

exports.remove = async () => {
  await fs.remove(file)
}

exports.save = async data => {
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(file)
  } catch (err) {}

  // Merge new data with the existing
  currentContent = Object.assign(currentContent, data)

  for (const newProp in data) {
    if (!{}.hasOwnProperty.call(data, newProp)) {
      continue
    }

    const propContent = currentContent[newProp]
    const isObject = typeof propContent === 'object'

    // Ensure that there are no empty objects inside the config
    if (isObject && Object.keys(propContent).length === 0) {
      delete currentContent[newProp]
    }
  }

  // Update config file
  await fs.writeJSON(file, currentContent, {
    spaces: 2
  })
}

exports.watchConfig = async windows => {
  if (!await pathExists(file) || !windows.main) {
    return
  }

  const mainWindow = windows.main

  fs.watch(file, eventType => {
    if (eventType !== 'change') {
      return
    }

    mainWindow.webContents.send('config-changed')
  })
}
