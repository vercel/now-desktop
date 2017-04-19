// Packages
const { dialog } = require('electron')

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  return false
}

exports.deploy = async () => {
  const info = {
    title: 'Select a file or directory to deploy',
    properties: ['openDirectory', 'openFile'],
    buttonLabel: 'Deploy'
  }

  const path = showDialog(info)

  if (path) {
    const deployment = require('./actions/deploy')

    try {
      await deployment(path)
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
