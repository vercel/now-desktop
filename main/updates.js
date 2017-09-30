// Native
const { homedir } = require('os')

// Packages
const { app, autoUpdater } = require('electron')
const ms = require('ms')
const semVer = require('semver')
const trimWhitespace = require('trim')
const exists = require('path-exists')
const { exec } = require('child-process-promise')
const isDev = require('electron-is-dev')

// Utilities
const { version } = require('../package')
const notify = require('./notify')
const binaryUtils = require('./utils/binary')
const { getConfig, saveConfig } = require('./utils/config')

const { platform } = process

const localBinaryVersion = async () => {
  // We need to modify the `cwd` to prevent the app itself (Now.exe) to be
  // executed on Windows. On other platforms this shouldn't produce side effects.
  const fullPath = binaryUtils.getFile()
  const cmd = await exec(`${fullPath} -v`, { cwd: homedir() })

  if (!cmd.stdout) {
    throw new Error('Not version tag received from `now -v`')
  }

  // Make version tag parsable
  const output = trimWhitespace(cmd.stdout.toString())

  if (semVer.valid(output)) {
    return output
  }

  // This is for the old version output
  // Example: "𝚫 now 4.3.0"
  // The new one (handled above) looks like this: "4.3.0"
  return output.split(' ')[2].trim()
}

const updateBinary = async () => {
  if (process.env.CONNECTION === 'offline') {
    return
  }

  const fullPath = binaryUtils.getFile()

  if (!await exists(fullPath)) {
    return
  }

  console.log('Checking for binary updates...')
  const remote = await binaryUtils.getURL()

  const currentRemote = remote.version
  const currentLocal = await localBinaryVersion()

  // Force an update if "now -v" fails
  if (currentLocal) {
    const comparision = semVer.compare(currentLocal, currentRemote)

    if (comparision !== -1) {
      console.log('No updates found for binary')
      return
    }

    console.log('Found an update for binary! Downloading...')
  }

  const updateFile = await binaryUtils.download(remote.url, remote.binaryName)

  // Check if the binary is working before moving it into place
  try {
    await binaryUtils.testBinary(updateFile.path)
  } catch (err) {
    console.log('The downloaded binary is broken')
    updateFile.cleanup()

    throw err
  }

  // Make sure there's no existing binary in the way
  await binaryUtils.handleExisting(updateFile.path)

  // Remove temporary directory that contained the update
  updateFile.cleanup()

  // Check the version of the installed binary
  const newVersion = await localBinaryVersion()

  notify({
    title: 'Updated Now CLI to Version ' + newVersion,
    body:
      'Feel free to try it in your terminal or click to see what has changed!',
    url: 'https://github.com/zeit/now-cli/releases/tag/' + newVersion
  })
}

const startBinaryUpdates = () => {
  const binaryUpdateTimer = time =>
    setTimeout(async () => {
      try {
        await updateBinary()
        binaryUpdateTimer(ms('10m'))
      } catch (err) {
        console.log(err)
        binaryUpdateTimer(ms('1m'))
      }
    }, time)

  binaryUpdateTimer(ms('2s'))
}

const checkForUpdates = () => {
  if (process.env.CONNECTION === 'offline') {
    // Try again after half an hour
    setTimeout(checkForUpdates, ms('30m'))
    return
  }

  autoUpdater.checkForUpdates()
}

const deleteUpdateConfig = () =>
  saveConfig(
    {
      desktop: {
        updatedFrom: null
      }
    },
    'config'
  )

const startAppUpdates = async mainWindow => {
  let config

  try {
    config = await getConfig(true)
  } catch (err) {
    config = {}
  }

  const updatedFrom = config.desktop && config.desktop.updatedFrom
  const appVersion = isDev ? version : app.getVersion()

  // Ensure that update state gets refreshed after relaunch
  deleteUpdateConfig()

  // If the current app version matches the old
  // app version, it's an indicator that installation
  // of the update failed
  if (updatedFrom && updatedFrom === appVersion) {
    console.error('An app update failed to install.')

    // Show a UI banner, allowing the user to retry
    mainWindow.webContents.send('update-failed')
    return
  }

  autoUpdater.on('error', error => {
    // Report errors to console. We can't report
    // to Slack and restart here, because it will
    // cause the app to never start again
    console.error(error)

    // Then check again for update after 15 minutes
    setTimeout(checkForUpdates, ms('15m'))
  })

  const isCanary = config.desktop && config.desktop.canary
  const channel = isCanary ? 'releases-canary' : 'releases'
  const feedURL = `https://now-desktop-${channel}.zeit.sh/update/${platform}`

  try {
    autoUpdater.setFeedURL(feedURL + '/' + app.getVersion())
  } catch (err) {}

  // Check for app update after startup
  setTimeout(checkForUpdates, ms('10s'))

  autoUpdater.on('update-downloaded', async () => {
    // Don't open the main window after re-opening
    // the app for this update. The `await` prefix is
    // important, because we need to save to config
    // before the app quits.

    // Here, we also ensure that failed update
    // installations result in a UI change that lets
    // the user retry manually.
    await saveConfig(
      {
        desktop: {
          updatedFrom: appVersion
        }
      },
      'config'
    )

    // Then restart the application
    autoUpdater.quitAndInstall()
    app.quit()
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for app updates...')
  })

  autoUpdater.on('update-available', () => {
    console.log('Found update for the app! Downloading...')
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No updates found. Checking again in 5 minutes...')
    setTimeout(checkForUpdates, ms('5m'))
  })
}

module.exports = mainWindow => {
  if (process.platform === 'linux') {
    return
  }

  startBinaryUpdates()

  if (!isDev) {
    startAppUpdates(mainWindow)
  }
}
