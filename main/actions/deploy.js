// Packages
const { dialog, nativeImage } = require('electron')
const determineType = require('deployment-type')
const pathExists = require('path-exists')
const { resolve } = require('app-root-path')

// Utilities
const upload = require('../utils/deployment/upload')
const { error: showError } = require('../dialogs')
const getPlan = require('../utils/data/plan')

const ossPrompt = async () => {
  const iconPath = resolve('./main/static/icons/mac.icns')
  const icon = nativeImage.createFromPath(iconPath)

  const response = dialog.showMessageBox({
    type: 'question',
    message: `You're on the OSS Plan`,
    detail: 'This means that your code and logs will be made public. Do you really want to deploy?',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
    icon
  })

  return response === 0
}

module.exports = async directory => {
  if (!await pathExists(directory)) {
    throw new Error("Path doesn't exist!")
  }

  let plan

  try {
    plan = await getPlan()
  } catch (err) {
    showError('Not able to get current plan', err)
    return
  }

  if (plan.id === 'oss') {
    const shouldDeploy = await ossPrompt()

    if (!shouldDeploy) {
      return
    }
  }

  let deploymentType

  try {
    deploymentType = await determineType(directory)
  } catch (err) {
    showError('Not able to determine deployment type', err)
    return
  }

  await upload(directory, deploymentType)
}
