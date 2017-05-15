// Packages
const { dialog } = require('electron')

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  return false
}

exports.share = async function(
  tray,
  properties = ['openDirectory', 'openFile']
) {
  const info = {
    title: 'Select something to share',
    properties,
    buttonLabel: 'Share'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

  if (!path) {
    return
  }

  const deploy = require('./actions/deploy')

  try {
    await deploy(path, true)
  } catch (err) {
    exports.error('Not able to share', err)
  }
}

exports.deploy = async function(tray) {
  const info = {
    title: 'Select a folder to deploy',
    properties: ['openDirectory'],
    buttonLabel: 'Deploy'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

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
