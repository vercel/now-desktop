// Packages
const { dialog } = require('electron')
const sudo = require('sudo-prompt')
const { resolve: resolvePath } = require('app-root-path')

// Utilities
const deploy = require('./actions/deploy')

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  return false
}

exports.runAsRoot = (command, why) => {
  const answer = dialog.showMessageBox({
    type: 'question',
    message: 'Now Needs More Permissions',
    detail: why,
    buttons: ['OK', 'Please, no!']
  })

  if (answer === 1) {
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
  const info = {
    title: 'Select a file or directory to deploy',
    properties: ['openDirectory', 'openFile'],
    buttonLabel: 'Deploy'
  }

  const path = showDialog(info)

  if (path) {
    try {
      await deploy(path)
    } catch (err) {
      exports.error('Not able to deploy', err)
    }
  }
}

exports.error = function(detail, trace, win) {
  // We need to log the error in order to be able to inspect it
  if (trace) {
    console.error(trace)
  }

  dialog.showMessageBox(win || null, {
    type: 'error',
    message: 'An Error Occurred',
    detail,
    buttons: []
  })
}
