// Native
const path = require('path')
const { homedir } = require('os')

// Packages
const fs = require('fs-promise')
const pathExists = require('path-exists')

// Path to config file
const file = path.join(homedir(), '.now.json')

exports.get = async () => {
  if (!await pathExists(file)) {
    throw new Error(`Could retrieve config file, it doesn't exist`)
  }

  const content = await fs.readJSON(file)

  if (!content.token) {
    throw new Error('No token contained inside config file')
  }

  if (!content.user) {
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

  // Update config file
  await fs.writeJSON(file, currentContent)
}
