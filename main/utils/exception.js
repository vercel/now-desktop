// Native
const queryString = require('querystring')

// Packages
const { app } = require('electron')
const serializeError = require('serialize-error')
const fetch = require('node-fetch')

module.exports = async error => {
  const errorParts = serializeError(error)

  const query = queryString.stringify({
    sender: 'Now Desktop',
    name: errorParts.name,
    message: errorParts.message,
    stack: errorParts.stack
  })

  try {
    await fetch('https://errors.zeit.sh/?' + query)
  } catch (err) {}

  app.quit()
}
