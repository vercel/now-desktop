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

export const getURL = async () => {
  const url = 'https://api.github.com/repos/zeit/now/releases/latest'

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

  const downloadURL = response.assets[0].browser_download_url

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
  const nowPath = path.join(baseDir, 'now')
  const nodePath = await which('node')

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
