// Packages
const { dialog, nativeImage, shell } = require('electron')
const { resolve } = require('app-root-path')

module.exports = config => {
  const iconPath = resolve('./main/static/icons/mac.icns')
  const icon = nativeImage.createFromPath(iconPath)

  const response = dialog.showMessageBox({
    type: 'question',
    message: `You Are on the OSS Plan`,
    detail:
      'This means that your code and logs will be publicly accessible. ' +
      'Do you really want to deploy?' +
      '\n\n' +
      'To prevent this message from showing up, upgrade to ' +
      'a higher plan using the button on the left.',
    buttons: ['Deploy', 'Cancel', 'Upgrade'],
    defaultId: 0,
    cancelId: 1,
    icon
  })

  if (response === 2) {
    let url = 'https://zeit.co/account/plan'

    if (config.currentTeam) {
      const { slug } = config.currentTeam
      url = `https://zeit.co/teams/${slug}/settings/plan`
    }

    shell.openExternal(url)
    return false
  }

  return response === 0
}
