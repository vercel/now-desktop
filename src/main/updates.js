// Native
import path from 'path'
import {execSync as exec} from 'child_process'
import {homedir} from 'os'

// Packages
import {autoUpdater} from 'electron-auto-updater'
import ms from 'ms'
import exists from 'path-exists'
import compareVersions from 'compare-versions'
import fs from 'fs-promise'
import log from 'electron-log'

// Ours
import {version} from '../../app/package'
import {error as showError} from './dialogs'
import notify from './notify'
import * as binaryUtils from './utils/binary'
import {track} from './analytics'

const platform = process.platform === 'darwin' ? 'osx' : process.platform
const feedURL = 'https://now-auto-updates.now.sh/update/' + platform

const localBinaryVersion = () => {
  // We need to modify the `cwd` to prevent the app itself (Now.exe) to be
  // executed on Windows. On other platforms this shouldn't produce side effects.
  const cmd = exec('now -v', {cwd: homedir()}).toString()
  const parts = cmd.split(' ')

  return parts[2].trim()
}

const updateBinary = async () => {
  const binaryDir = binaryUtils.getPath()
  const fullPath = path.join(binaryDir, `now${binaryUtils.getBinarySuffix()}`)

  if (!await exists(fullPath)) {
    return
  }

  if (process.env.BINARY_UPDATE_RUNNING === 'yes') {
    return
  }

  process.env.BINARY_UPDATE_RUNNING = 'yes'
  console.log('Checking for binary updates...')

  const currentRemote = await binaryUtils.getURL()
  const currentLocal = localBinaryVersion()

  const comparision = compareVersions(currentLocal, currentRemote.version)

  if (comparision !== -1) {
    console.log('No updates found for binary')
    return
  }

  console.log('Found update for binary! Downloading...')

  let updateFile

  try {
    updateFile = await binaryUtils.download(currentRemote.url, currentRemote.binaryName)
  } catch (err) {
    console.error('Could not download update for binary')
    return
  }

  try {
    await fs.remove(fullPath)
  } catch (err) {
    console.error(err)
    return
  }

  try {
    await fs.rename(updateFile.path, fullPath)
  } catch (err) {
    console.error(err)
    return
  }

  // Make the binary executable
  try {
    await binaryUtils.setPermissions(binaryDir)
  } catch (err) {
    console.error(err)
  }

  updateFile.cleanup()
  process.env.BINARY_UPDATE_RUNNING = 'no'

  notify({
    title: `Updated ${binaryDir}/now to v${currentRemote.version}`,
    body: 'Try it in your terminal!'
  })

  track('Updated binary', {
    'To Version': currentRemote.version
  })
}

export default app => {
  setInterval(() => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    updateBinary()
  }, ms('15m'))

  autoUpdater.on('error', err => {
    console.error(err)
    log.info(err)
  })

  try {
    autoUpdater.setFeedURL(feedURL + '/' + version)
  } catch (err) {
    // We don't need the URL on Windows
    if (process.platform !== 'win32') {
      showError('Auto updated could not set feed URL', err)
    }
  }

  const checkForUpdates = () => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    autoUpdater.checkForUpdates()
  }

  // Check once in the beginning
  setTimeout(() => {
    // Update the app itself
    checkForUpdates()

    // ...and the binary
    updateBinary()
  }, ms('10s'))

  // And then every 5 minutes
  setInterval(checkForUpdates, ms('5m'))

  autoUpdater.on('update-downloaded', () => {
    process.env.UPDATE_STATUS = 'downloaded'
    log.info('Downloaded update')

    track('Downloaded update')

    setInterval(() => {
      if (process.env.BUSYNESS !== 'ready') {
        return
      }

      log.info('Installing update')
      track('Installing update')

      autoUpdater.quitAndInstall()
      app.quit()
    }, ms('2s'))
  })
}
