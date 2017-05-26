// Packages
const determineType = require('deployment-type')
const pathExists = require('path-exists')

// Utilities
const upload = require('../utils/deployment/upload')
const { error: showError } = require('../dialogs')

module.exports = async directory => {
  if (!await pathExists(directory)) {
    throw new Error("Path doesn't exist!")
  }

  let deploymentType

  try {
    deploymentType = await determineType(directory)
  } catch (err) {
    showError(err)
    return
  }

  await upload(directory, deploymentType)
}
