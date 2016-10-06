// Packages
import {app, BrowserWindow} from 'electron'
import {resolve as resolvePath} from 'app-root-path'

let win

// the hack of all hacks
// electron doesn't have a built in notification thing,
// so we launch a window on which we can use the
// HTML5 `Notification` API :'(

let buffer = []

const notify = details => {
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
