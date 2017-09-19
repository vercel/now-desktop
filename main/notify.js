// Packages
const { shell, Notification } = require('electron')
const { resolve } = require('app-root-path')

const icon = resolve('./main/static/icons/windows.ico')

module.exports = ({ title, body, url, onClick, silent = false }) => {
  const specs = {
    title,
    body,
    icon,
    silent
  }

  const notification = new Notification(specs)

  if (url || onClick) {
    notification.on('click', () => {
      if (onClick) {
        return onClick()
      }

      shell.openExternal(url)
    })
  }

  notification.show()
  console.log(`[Notification] ${title}: ${body}`)
}
