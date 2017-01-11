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
import {resolve as resolvePath} from 'app-root-path'

// Ours
import {error as showError} from '../dialogs'

export const getPath = () => {
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

  const forPlatform = response.assets.map(asset => {
    return asset.platform === platformName()
  })

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
    path: path.join(tempDir.path, 'now-macos'),
    cleanup: tempDir.cleanup
  }
}

export const handleExisting = async () => {
  let existing

  try {
    existing = await which('now')
  } catch (err) {
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

  const nowPath = path.join(baseDir, 'now')

  if (nodePath) {
    // Get permissions from node binary
    const nodeStats = await fs.stat(nodePath)

    if (nodeStats.mode) {
      // And copy them over to ours
      await fs.chmod(baseDir + '/now', nodeStats.mode)
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
