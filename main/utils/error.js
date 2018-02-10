// Native
const queryString = require('querystring')

// Packages
const { app, dialog } = require('electron')
const serializeError = require('serialize-error')
const fetch = require('node-fetch')
const isDev = require('electron-is-dev')
const bytes = require('bytes')

// Utilities
const userAgent = require('./user-agent')

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

const renderError = trace => {
  const { code } = trace

  if (code === 'size_limit_exceeded') {
    const limit = bytes(trace.sizeLimit, { unitSeparator: ' ' })

    return {
      message: 'File Size Limit Exceeded',
      detail:
        `You tried to upload a file that is bigger than your plan's file size limit (${limit}).\n\n` +
        `In order to be able to upload it, you need to switch to a higher plan.`
    }
  }

  return {}
}

exports.error = (detail, trace, win) => {
  const message = {
    type: 'error',
    message: 'An Error Occurred',
    detail,
    buttons: []
  }

  if (trace) {
    console.error(trace)

    if (trace.code) {
      Object.assign(message, renderError(trace))
    }
  }

  dialog.showMessageBox(win || null, message)
}
