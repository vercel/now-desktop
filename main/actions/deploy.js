// Packages
const { dialog } = require('electron')
const determineType = require('deployment-type')
const pathExists = require('path-exists')

// Utilities
const upload = require('../utils/deployment/upload')
const { error: showError } = require('../dialogs')
const getPlan = require('../utils/data/plan')

const ossPrompt = async () => {
  const response = dialog.showMessageBox({
    type: 'question',
    message: `You're on the OSS Plan`,
    detail: 'This means that your code and logs will be made public. Do you really want to deploy?',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1
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
    showError(err)
    return
  }

  await upload(directory, deploymentType)
}
