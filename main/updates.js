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
const notify = require('./notify')
const binaryUtils = require('./utils/binary')
const { saveConfig } = require('./utils/config')
const handleException = require('./utils/exception')

const platform = process.platform === 'darwin' ? 'osx' : process.platform
const feedURL = 'https://now-desktop-releases.zeit.sh/update/' + platform

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
    title: 'Updated now CLI to Version ' + newVersion,
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

const startAppUpdates = () => {
  // Report auto update errors to Slack
  autoUpdater.on('error', error => handleException(error, false))

  try {
    autoUpdater.setFeedURL(feedURL + '/' + app.getVersion())
  } catch (err) {}

  const checkForUpdates = () => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    autoUpdater.checkForUpdates()
  }

  // And then every 5 minutes
  setInterval(checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => {
    setInterval(() => {
      // Don't open the main window after re-opening
      // the app for this update
      saveConfig({
        desktop: {
          updated: true
        }
      })

      // Then restart the application
      autoUpdater.quitAndInstall()
    }, ms('2s'))
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for app updates...')
  })

  autoUpdater.on('update-available', () => {
    console.log('Found update for the app! Downloading...')
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No updates found for the app')
  })
}

module.exports = () => {
  if (process.platform === 'linux') {
    return
  }

  startBinaryUpdates()

  if (!isDev) {
    startAppUpdates()
  }
}
