// Native
const queryString = require('querystring')

// Packages
const { shell, app, dialog } = require('electron')
const serializeError = require('serialize-error')
const fetch = require('node-fetch')
const isDev = require('electron-is-dev')
const bytes = require('bytes')

// Utilities
const userAgent = require('./user-agent')
const { getConfig } = require('./config')

exports.exception = async error => {
  let errorParts = {}

  if (typeof error === 'string') {
    errorParts.name = 'Error'
    errorParts.message = 'An error occured'
    errorParts.stack = error
  } else {
    // Make the error sendable using GET
    errorParts = serializeError(error)
  }

  // Log the error to the console
  console.error(errorParts)

  // Prepare the request query
  const query = queryString.stringify({
    sender: 'Now Desktop',
    name: errorParts.name,
    message: errorParts.message,
    stack: errorParts.stack
  })

  // Post the error to slack
  try {
    await fetch('https://errors.zeit.sh/?' + query, {
      headers: {
        'user-agent': userAgent
      }
    })
  } catch (err) {}

  // Restart the app, so that it doesn't continue
  // running in a broken state
  if (!isDev) {
    app.relaunch()
  }

  app.exit(0)
}

const renderError = async trace => {
  const { code } = trace

  if (code === 'size_limit_exceeded') {
    const limit = bytes(trace.sizeLimit, { unitSeparator: ' ' })
    let buttons = []

    try {
      const config = await getConfig()
      let url = 'https://zeit.co/account/plan'

      if (config.currentTeam) {
        const { slug } = config.currentTeam
        url = `https://zeit.co/teams/${slug}/settings/plan`
      }

      buttons.push({
        label: 'Ignore'
      })

      buttons = [
        {
          label: 'Upgrade',
          url
        },
        {
          label: 'Ignore'
        }
      ]
    } catch (err) {}

    return {
      message: 'File Size Limit Exceeded',
      detail:
        `You tried to upload a file that is bigger than your plan's file size limit (${limit}).\n\n` +
        `In order to be able to upload it, you need to switch to a higher plan.`,
      buttons,
      defaultId: 0
    }
  }

  return {}
}

exports.error = async (detail, trace, win) => {
  const message = {
    type: 'error',
    message: 'An Error Occurred',
    detail,
    buttons: []
  }

  let modified

  if (trace) {
    console.error(trace)

    if (trace.code) {
      modified = await renderError(trace)
    }
  }

  if (modified) {
    Object.assign(
      message,
      modified,
      modified.buttons
        ? {
            buttons: modified.buttons.map(button => button.label)
          }
        : {}
    )
  }

  const answer = dialog.showMessageBox(win || null, message)
  let target = {}

  if (modified.buttons && modified.buttons.length > 0) {
    target = modified.buttons.find(button => {
      return button.label === message.buttons[answer]
    })
  }

  if (target.url) {
    shell.openExternal(target.url)
  }
}
