// Packages
const { dialog, nativeImage } = require('electron')
const { resolve } = require('app-root-path')

module.exports = () => {
  const iconPath = resolve('./main/static/icons/mac.icns')
  const icon = nativeImage.createFromPath(iconPath)

  const response = dialog.showMessageBox({
    type: 'question',
    message: `You're on the OSS Plan`,
    detail:
      'This means that your code and logs will be made public. Do you really want to deploy?',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    cancelId: 1,
    icon
  })

  return response === 0
}
