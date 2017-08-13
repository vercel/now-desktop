// Native
const queryString = require('querystring')

// Packages
const { app } = require('electron')
const serializeError = require('serialize-error')
const fetch = require('node-fetch')

// Utilities
const userAgent = require('./user-agent')

const ignored = [
  'request timed out',
  'SSL error has occurred',
  'read-only volume'
]

module.exports = async (error, relaunch = true) => {
  let errorParts = {}

  if (typeof error === 'string') {
    errorParts.name = 'Error'
    errorParts.message = 'An error occured'
    errorParts.stack = error
  } else {
    // Make the error sendable using GET
    errorParts = serializeError(error)
  }

  for (const toIgnore of ignored) {
    // Certain errors should not lead to any actions
    if (errorParts.stack.includes(toIgnore)) {
      return
    }
  }

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
  if (relaunch) {
    app.relaunch()
    app.exit(0)
  }
}
