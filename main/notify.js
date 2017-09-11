// Packages
const { shell, Notification } = require('electron')
const { resolve } = require('app-root-path')

const icon = resolve('./main/static/icons/windows.ico')

module.exports = ({ title, body, url, actions }) => {
  const specs = {
    title,
    body,
    icon
  }

  if (actions) {
    specs.actions = []

    for (const action of actions) {
      specs.actions.push({
        type: 'button',
        text: action.label
      })
    }
  }

  const notification = new Notification(specs)

  if (url) {
    notification.on('click', () => shell.openExternal(url))
  }

  if (actions) {
    // This only happens for signed apps
    notification.on('action', (event, index) => {
      actions[index].callback()
    })
  }

  notification.show()
  console.log(`[Notification] ${title}: ${body}`)
}
