// Packages
const { dialog } = require('electron')
const sudo = require('sudo-prompt')
const { resolve: resolvePath } = require('app-root-path')

// Utilities
const deploy = require('./utils/deploy')

exports.runAsRoot = (command, why) => {
  const isWin = process.platform === 'win32'
  const buttons = ['OK', 'Cancel']

  if (isWin) {
    buttons.reverse()
  }

  const answer = dialog.showMessageBox({
    type: 'question',
    message: 'Now Needs More Permissions',
    detail: why,
    buttons
  })

  // The order of options is different on Windows
  if (answer === (isWin ? 0 : 1)) {
    throw new Error('No permissions given')
  }

  return new Promise((resolve, reject) => {
    const options = {
      name: 'Now',
      icns: resolvePath('./main/static/icons/mac.icns')
    }

    sudo.exec(command, options, async error => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

exports.deploy = async () => {
  const details = {
    title: 'Select a file or directory to deploy',
    properties: ['openDirectory', 'openFile', 'multiSelections'],
    buttonLabel: 'Deploy'
  }

  const paths = dialog.showOpenDialog(details)

  if (!paths) {
    return
  }

  try {
    await deploy(paths)
  } catch (err) {
    exports.error('Not able to deploy', err)
  }
}
