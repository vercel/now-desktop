// Native
const queryString = require('querystring')

// Packages
const { app, dialog } = require('electron')
const serializeError = require('serialize-error')
const fetch = require('node-fetch')
const isDev = require('electron-is-dev')

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

exports.error = (detail, trace, win) => {
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
