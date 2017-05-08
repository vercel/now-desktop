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

  if (content.user) {
    for (const userProp in content.user) {
      if (!{}.hasOwnProperty.call(content.user, userProp)) {
        continue
      }

      content[userProp] = content.user[userProp]
    }
  }

  if (!content.token) {
    throw new Error('No token contained inside config file')
  }

  if (!content.email) {
    throw new Error('No email contained inside config file')
  }

  return content
}

exports.remove = async () => {
  const currentContent = await exports.get()

  if (currentContent.email) {
    delete currentContent.email
  }

  if (currentContent.token) {
    delete currentContent.token
  }

  await fs.writeJSON(file, currentContent)
}

exports.save = async (email, token) => {
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(file)
  } catch (err) {}

  currentContent.email = email
  currentContent.token = token

  await fs.writeJSON(file, currentContent)
}
