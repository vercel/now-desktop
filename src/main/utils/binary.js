// Native
import path from 'path'

// Packages
import fetch from 'node-fetch'
import tmp from 'tmp-promise'
import retry from 'async-retry'
import load from 'download'
import fs from 'fs-promise'
import which from 'which-promise'
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
    const path = `${process.env.LOCALAPPDATA}\\now-cli`
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
      name = 'Windows'
      break
    case 'darwin':
      name = 'macOS'
      break
    default:
      name = original
  }

  return name
}

export const getBinarySuffix = () => process.platform === 'win32' ? '.exe' : ''

export const getURL = async () => {
  const url = 'https://now-cli-latest.now.sh'

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

  const forPlatform = response.assets.find(asset => asset.platform === platformName())

  if (!forPlatform) {
    return
  }

  const downloadURL = forPlatform.url

  if (!downloadURL) {
    showError('Latest release doesn\'t contain a binary')
    return
  }

  return {
    url: downloadURL,
    version: response.tag,
    binaryName: forPlatform.name
  }
}

export const download = async (url, binaryName) => {
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
    path: path.join(tempDir.path, binaryName),
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

  try {
    await fs.remove(existing)
  } catch (err) {
    showError('Not able to remove existing binary', err)
  }
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

    // We don't want to insert the directory into the PATH if it's already there
    if (pathEntry.value.includes(folder)) {
      resolve()
      return
    }

    regKey.set(pathEntry.name, pathEntry.type, `${pathEntry.value};${folder}`, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  }))
}
