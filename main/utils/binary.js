// Native
const path = require('path')
const { spawnSync } = require('child_process')

// Packages
const { ipcMain } = require('electron')
const fetch = require('node-fetch')
const tmp = require('tmp-promise')
const load = require('download')
const fs = require('fs-promise')
const which = require('which-promise')
const sudo = require('sudo-prompt')
const { resolve: resolvePath } = require('app-root-path')
const { sync: mkdir } = require('mkdirp')
const Registry = require('winreg')
const globalPackages = require('global-packages')

const runAsRoot = command =>
  new Promise((resolve, reject) => {
    const options = {
      name: 'Now',
      icns: resolvePath('./main/static/icons/mac.icns')
    }

    sudo.exec(command, options, async error => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

// Ensures that the `now.exe` directory is on the user's `PATH`
const ensurePath = async () => {
  if (process.platform !== 'win32') {
    return
  }

  const folder = exports.getDirectory()

  const regKey = new Registry({
    hive: Registry.HKCU,
    key: '\\Environment'
  })

  return new Promise((resolve, reject) =>
    regKey.values((err, items) => {
      if (err) {
        reject(err)
        return
      }

      const pathEntry = items.find(
        item => String(item.name).toLowerCase() === 'path'
      )

      if (pathEntry === undefined) {
        reject(new Error('Could not find `Path` entry in the Registry'))
        return
      }

      // We don't want to insert the directory into the PATH if it's already there
      if (pathEntry.value.includes(folder)) {
        resolve()
        return
      }

      regKey.set(
        pathEntry.name,
        pathEntry.type,
        `${pathEntry.value};${folder}`,
        err => {
          if (err) {
            reject(err)
            return
          }

          // Here we use a very clever hack that was developed by igorklopov:
          // When we edit the `PATH` var in the registry, the `explorer.exe` will
          // not be notified of such change. That sid, when we tell the user
          // to try `now` = require(the command line, it'll not work – `explorer.exe`
          // will pass an old PATH value to the `cmd.exe`. To _fix_ that, we use
          //  the `setx` command to set a temporary empty env var. Such command will
          // broadcast all env vars to `explorer.exe` and _fix_ our problem – the
          // user will now be able to use `now` in the command line right after
          // the installation.
          spawnSync('setx', ['NOW_ENSURE_PATH_TMP', '""'])

          // Here we remove the temporary env var = require(the registry
          regKey.remove('NOW_ENSURE_PATH_TMP', () => resolve())
        }
      )
    })
  )
}

const setPermissions = async () => {
  let nodePath

  try {
    nodePath = await which('node')
  } catch (err) {}

  const nowPath = exports.getFile()

  if (nodePath) {
    // Get permissions = require(node binary
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

  const sudoCommand = `chmod +x ${nowPath}`
  return runAsRoot(sudoCommand)
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

// Retruns the path in which the `now` binary should be saved
exports.getDirectory = () => {
  if (process.platform === 'win32') {
    const path = `${process.env.LOCALAPPDATA}\\now-cli`
    mkdir(path)
    return path
  }

  const path = process.env.PATH.split(':')
  const first = path.join(process.env.HOME, 'bin')
  const second = '/usr/local/bin'

  if (path.includes(first)) {
    return first
  } else if (path.includes(second)) {
    return second
  }

  return '/usr/bin'
}

exports.npmBinaryInstalled = async () => {
  let packages

  try {
    packages = await globalPackages()
  } catch (err) {
    return false
  }

  if (!Array.isArray(packages)) {
    return false
  }

  const target = packages.filter(item => item.name === 'now')

  if (!target || target.linked) {
    return false
  }

  return true
}

exports.getFile = () => {
  const destDirectory = exports.getDirectory()
  const suffix = exports.getBinarySuffix()

  return path.join(destDirectory, 'now' + suffix)
}

exports.handleExisting = async next => {
  const destFile = exports.getFile()

  try {
    // Firstly, try overwriting the file without root permissions
    // If it doesn't work, ask for password
    await fs.rename(next, destFile)
  } catch (err) {
    // We need to remove the old file first
    // Because neither `mv`, nor `move` overwrite
    try {
      await fs.remove(destFile)
    } catch (err) {
      const removalPrefix = process.platform === 'win32' ? 'del /f' : 'rm -f'
      const removalCommand = `${removalPrefix} ${destFile}`

      await runAsRoot(removalCommand)
    }

    const movePrefix = process.platform === 'win32' ? 'move' : 'mv'
    const moveCommand = `${movePrefix} ${next} ${destFile}`

    // Then move the new binary into position
    await runAsRoot(moveCommand)
  }

  await setPermissions()
  await ensurePath()
}

exports.getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

exports.getURL = async () => {
  const url = 'https://now-cli-latest.zeit.sh'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Binary response not okay')
  }

  const responseParsed = await response.json()

  if (!responseParsed.assets || responseParsed.assets.length < 1) {
    throw new Error('Not able to get URL of latest binary')
  }

  const forPlatform = responseParsed.assets.find(
    asset => asset.platform === platformName()
  )

  if (!forPlatform) {
    throw new Error('Not able to select platform of latest binary')
  }

  const downloadURL = forPlatform.url

  if (!downloadURL) {
    throw new Error(`Latest release doesn't contain a binary`)
  }

  return {
    url: downloadURL,
    version: responseParsed.tag,
    binaryName: forPlatform.name
  }
}

exports.download = (url, binaryName, onUpdate) =>
  new Promise(async (resolve, reject) => {
    let tempDir

    try {
      tempDir = await tmp.dir()
    } catch (err) {
      reject(err)
      return
    }

    ipcMain.once('online-status-changed', (event, status) => {
      if (status === 'offline') {
        const error = new Error(`You wen't offline! Stopping download...`)
        error.name = 'offline'

        reject(error)
      }
    })

    const binaryDownload = load(url)

    if (onUpdate) {
      let bytes = 0
      let bytesLoaded = 0
      let percentage

      binaryDownload.on('response', res => {
        if (res && res.headers) {
          bytes = res.headers['content-length']
          return
        }

        reject(new Error('Not able to get binary size'))
      })

      binaryDownload.on('data', chunk => {
        if (!bytes) {
          return
        }

        bytesLoaded += chunk.length
        const newPercentage = parseInt(bytesLoaded / bytes * 100, 10)

        if (newPercentage === percentage) {
          return
        }

        // Cache the progess percentage
        percentage = newPercentage

        // Update the progress bar
        onUpdate(percentage)
      })
    }

    const destination = path.join(tempDir.path, binaryName)
    const stream = binaryDownload.pipe(fs.createWriteStream(destination))

    stream.on('finish', () => {
      resolve({
        path: path.join(tempDir.path, binaryName),
        cleanup: tempDir.cleanup
      })
    })

    stream.on('error', reject)
  })
