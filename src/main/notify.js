// Packages
import {app, BrowserWindow} from 'electron'
import {resolve as resolvePath} from 'app-root-path'

let win

// the hack of all hacks
// electron doesn't have a built in notification thing,
// so we launch a window on which we can use the
// HTML5 `Notification` API :'(

let buffer = []

const icon = resolvePath('../app/assets/icons/windows-notification-icon.png')

const notify = details => {
  // On Windows we use the balloon API instead of HTML5's Notification API
  // because the latter doesn't show the app icon/name
  // Also, on Window 7 the Notification API is not available
  if (process.platform === 'win32') {
    global.tray.displayBalloon({
      icon,
      title: details.title,
      content: details.body
    })

    return
  }

  const {title, body, url} = details
  console.log(`[Notification] ${title}: ${body}`)

  if (win) {
    win.webContents.send('notification', {
      title,
      body,
      url
    })
  } else {
    buffer.push([
      title,
      body,
      url
    ])
  }
}

app.on('ready', () => {
  const win_ = new BrowserWindow({
    show: false
  })

  const url = 'file://' + resolvePath('../app/pages/notify.html')
  win_.loadURL(url)

  win_.webContents.on('dom-ready', () => {
    win = win_

    buffer.forEach(([details]) => notify(details))
    buffer = null
  })
})

export default notify
