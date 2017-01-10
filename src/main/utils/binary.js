// Native
import path from 'path'

// Packages
import fetch from 'node-fetch'
import tmp from 'tmp-promise'
import retry from 'async-retry'
import load from 'download'
import fs from 'fs-promise'
import which from 'which-promise'
import exists from 'path-exists'
import log from 'electron-log'
import sudo from 'sudo-prompt'
import {path as appRootPath, resolve as resolvePath} from 'app-root-path'
import {sync as mkdir} from 'mkdirp'
import Registry from 'winreg'

// Ours
import {error as showError} from '../dialogs'

// Retruns the path in which the `now` binary should be saved
export const getPath = () => {
  if (process.platform === 'win32') {
    const path = `${process.env.LOCALAPPDATA}\\now`
    mkdir(path)
    return path
  }
  const path = process.env.PATH.split(':')
  const first = '/usr/local/bin'

  if (path.includes(first)) {
    return first
  }

  return '/usr/bin'
}

const platformName = () => {
  const original = process.platform
  let name

  switch (original) {
    case 'win32':
      name = 'win'
      break
    case 'darwin':
      name = 'macos'
      break
    default:
      name = original
  }

  return name
}

export const getBinarySuffix = () => process.platform === 'win32' ? '.exe' : ''

// Returns the binary name used in the `artifacts` section of the GitHub release
const getBinaryName = () => {
  const platform = platformName()

  return `now-${platform}${getBinarySuffix()}`
}

export const getURL = async () => {
  const url = 'https://now-cli-releases.now.sh'

  let response

  try {
    response = await fetch(url)
  } catch (err) {
    log.info(err)
    return
  }

  if (!response.ok) {
    return
  }

  try {
    response = await response.json()
  } catch (err) {
    showError('Could not parse response as JSON', err)
    return
  }

  if (!response.assets || response.assets.length < 1) {
    return
  }

  let forPlatform
  const binaryName = getBinaryName()

  for (const asset of response.assets) {
    if (asset.name !== binaryName) {
      continue
    }

    forPlatform = asset
  }

  if (!forPlatform) {
    return
  }

  const downloadURL = forPlatform.browser_download_url

  if (!downloadURL) {
    showError('Latest release doesn\'t contain a binary')
    return
  }

  return {
    url: downloadURL,
    version: response.tag_name
  }
}

export const download = async url => {
  let tempDir

  try {
    tempDir = await tmp.dir()
  } catch (err) {
    showError('Could not create temporary directory', err)
    return
  }

  try {
    await retry(async () => {
      await load(url, tempDir.path)
    })
  } catch (err) {
    showError('Could not download binary', err)
    return
  }

  return {
    path: path.join(tempDir.path, getBinaryName()),
    cleanup: tempDir.cleanup
  }
}

export const handleExisting = async () => {
  let existing

  try {
    existing = await which('now', {all: true})
  } catch (err) {
    return
  }

  // On Windows the now-desktop executable name is `Now.exe`. If we run `where now`
  // from inside the app, the first result will be such executable.
  // Because of that, we need to ask `which-promise` to return all the results and then
  // ignore the first one, since it's the app itself
  if (process.platform === 'win32') {
    const first = path.parse(existing[0])
    if (appRootPath.startsWith(first.dir)) {
      existing.shift()
    }
  }

  // `which-promise` will return an array even on macOS and Linux
  existing = existing.shift()
  if (existing === undefined) {
    return
  }

  const details = path.parse(existing)
  let index = 1

  const newFile = await retry(async () => {
    details.name = details.base = 'now.old.' + index.toString()
    const newFile = path.format(details)

    if (await exists(newFile)) {
      throw new Error('Binary already exists')
    }

    return newFile
  }, {
    onRetry() {
      ++index
    }
  })

  try {
    await fs.rename(existing, newFile)
  } catch (err) {}
}

export const setPermissions = async baseDir => {
  let nodePath

  try {
    nodePath = await which('node')
  } catch (err) {}

  const nowPath = path.join(baseDir, `now${getBinarySuffix()}`)

  if (nodePath) {
    // Get permissions from node binary
    const nodeStats = await fs.stat(nodePath)

    if (nodeStats.mode) {
      // And copy them over to ours
      await fs.chmod(nowPath, nodeStats.mode)
    }

    const nowStats = await fs.stat(nowPath)

    if (nowStats.mode === nodeStats.mode) {
      return
    }
  }

  const sudoOptions = {
    name: 'Now',
    icns: resolvePath('/dist/icons/icon.icns')
  }

  const cmd = 'chmod +x ' + nowPath

  // Request password from user
  return new Promise((resolve, reject) => sudo(cmd, sudoOptions, (err, stdout) => {
    if (err) {
      reject(err)
      return
    }

    resolve(stdout)
  }))
}

// Ensures that the `now.exe` directory is on the user's `PATH`
export const ensurePath = async () => {
  if (process.platform !== 'win32') {
    return
  }

  const folder = getPath()
  if (process.env.PATH.includes(folder)) {
    return
  }

  const regKey = new Registry({
    hive: Registry.HKCU,
    key: '\\Environment'
  })

  return new Promise((resolve, reject) => regKey.values((err, items) => {
    if (err) {
      reject(err)
      return
    }

    const pathEntry = items.find(item => String(item.name).toLowerCase() === 'path')

    if (pathEntry === undefined) {
      reject(new Error('Could not find `Path` entry in the Registry'))
      return
    }

    // At this point we can insert now's directory in the PATH without verifying
    // if it's already there
    regKey.set(pathEntry.name, pathEntry.type, `${pathEntry.value};${folder}`, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  }))
}
