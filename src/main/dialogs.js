// Packages
import {dialog, shell} from 'electron'

// Ours
import deployment from './actions/deploy'
import sharing from './actions/share'

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details)

  if (filePath) {
    return filePath[0]
  }

  return false
}

export async function share(tray) {
  const info = {
    title: 'Select something to share',
    properties: [
      'openDirectory',
      'openFile'
    ],
    buttonLabel: 'Share'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

  if (!path) {
    return
  }

  try {
    await sharing(path)
  } catch (err) {
    error('Not able to share', err)
  }
}

export async function deploy(tray) {
  const info = {
    title: 'Select a folder to deploy',
    properties: [
      'openDirectory'
    ],
    buttonLabel: 'Deploy'
  }

  tray.setHighlightMode('always')
  const path = showDialog(info)
  tray.setHighlightMode('never')

  if (path) {
    try {
      await deployment(path)
    } catch (err) {
      error('Not able to deploy', err)
    }
  }
}

export function error(detail, trace, win) {
  const app = global.appInstance

  const buttons = [
    'Go away'
  ]

  if (trace) {
    buttons.unshift('Report it')
  }

  const goAway = dialog.showMessageBox(win || null, {
    type: 'error',
    message: 'An Error Occured',
    detail,
    buttons
  })

  let url = 'https://github.com/zeit/now-app/issues/new'

  if (!trace) {
    // Restart the application
    app.relaunch()
    app.quit()

    return
  }

  if (trace instanceof Error) {
    trace = trace.stack.toString()
    console.error(trace)
  }

  // Just log it as well to be sure
  console.error(detail)

  if (!goAway) {
    // Set the issue content
    url += '?body=' + encodeURIComponent(trace)
    url += '&title=' + encodeURIComponent(detail)

    // Add label "patch"
    url += '&labels=patch'

    shell.openExternal(url)
  }

  // Restart the application
  app.relaunch()
  app.quit()
}
