// Packages
const fetch = require('node-fetch')

// Utilities
const { error: showError } = require('../dialogs')
const notify = require('../notify')
const { removeConfig, getConfig } = require('./config')
const userAgent = require('./user-agent')

const endpoint = 'https://zeit.co/api/user/tokens/'

const requestHeaders = token => ({
  headers: {
    Authorization: `bearer ${token}`,
    'user-agent': userAgent
  }
})

const getTokenId = async token => {
  let result

  try {
    result = await fetch(endpoint, requestHeaders(token))
  } catch (err) {
    showError('Could not fetch token id for revoking it on logout', err)
    return
  }

  const tokenList = await result.json()

  if (!tokenList.tokens) {
    return
  }

  const tokenInfo = tokenList.tokens.find(t => token === t.token)

  if (!tokenInfo) {
    return
  }

  return tokenInfo.id
}

const revokeToken = async (token, tokenId) => {
  const details = {
    method: 'DELETE'
  }

  Object.assign(details, requestHeaders(token))

  let result

  try {
    result = await fetch(endpoint + encodeURIComponent(tokenId), details)
  } catch (err) {
    showError('Could not revoke token on logout', err)
    return
  }

  if (!result.ok) {
    console.error('Not able to log out')
  }
}

module.exports = async reason => {
  const offline = process.env.CONNECTION === 'offline'
  const windows = global.windows

  // Indicate that we're logging out
  console.log('Logging out...')

  // The app shouldn't log out if an error occurs while offline
  // Only do that while online
  if (offline || !windows) {
    return
  }

  // Hide the main window and close the dev tools
  if (windows && windows.main) {
    const contents = windows.main.webContents

    if (contents.isDevToolsOpened()) {
      contents.closeDevTools()
    }

    windows.main.hide()
  }

  // Cache user information
  let userDetails

  try {
    userDetails = await getConfig()
  } catch (err) {}

  try {
    await removeConfig()
  } catch (err) {
    showError("Couldn't remove config while logging out", err)
  }

  const tutorialWindow = windows.tutorial

  // Prepare the tutorial by reloading its contents
  tutorialWindow.reload()

  // Once the content has loaded again, show it
  tutorialWindow.once('ready-to-show', () => {
    if (reason) {
      let body

      // This can be extended later
      switch (reason) {
        case 'config-removed':
          body =
            'You were logged out because you logged out from Now CLI. Click here to log back in.'
          break
        default:
          body = false
      }

      if (body) {
        notify({
          title: 'Logged Out',
          body,
          onClick() {
            tutorialWindow.show()
          }
        })

        return
      }
    }

    tutorialWindow.show()
  })

  if (!userDetails) {
    return
  }

  let tokenId

  try {
    tokenId = await getTokenId(userDetails.token)
  } catch (err) {
    showError('Not able to get token id on logout', err)
    return
  }

  if (!tokenId) {
    return
  }

  try {
    await revokeToken(userDetails.token, tokenId)
  } catch (err) {
    showError('Could not revoke token on logout', err)
  }
}
