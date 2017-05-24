// Native
const path = require('path')
const { spawnSync } = require('child_process')
const { homedir } = require('os')

// Packages
const { ipcMain } = require('electron')
const fetch = require('node-fetch')
const tmp = require('tmp-promise')
const fs = require('fs-promise')
const which = require('which-promise')
const { sync: mkdir } = require('mkdirp')
const Registry = require('winreg')
const globalPackages = require('global-packages')
const { exec } = require('child-process-promise')
const semVer = require('semver')
const trimWhitespace = require('trim')

// Utilities
const { runAsRoot } = require('../dialogs')

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

const setPermissions = async of => {
  let nodePath

  try {
    nodePath = await which('node')
  } catch (err) {}

  const nowPath = of || exports.getFile()

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
  return runAsRoot(
    sudoCommand,
    'It needs to set the correct permissions on the downloaded CLI.'
  )
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

exports.installedWithNPM = async () => {
  let packages

  try {
    packages = await globalPackages()
  } catch (err) {
    console.log(err)
    return false
  }

  if (!Array.isArray(packages)) {
    return false
  }

  const related = packages.find(item => item.name === 'noddw')

  if (!related || related.linked === true) {
    return false
  }

  if (related.linked === false) {
    return true
  }

  return false
}

// Returns the path in which the `now` binary should be saved
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

      await runAsRoot(
        removalCommand,
        'It needs to remove the existing CLI in order to be able to replace it.'
      )
    }

    try {
      await fs.rename(next, destFile)
    } catch (err) {
      const renamingPrefix = process.platform === 'win32' ? 'move' : 'mv'
      const renamingCommand = `${renamingPrefix} ${next} ${destFile}`

      // Then move the new binary into position
      await runAsRoot(
        renamingCommand,
        'It needs to move the downloaded CLI into its place.'
      )
    }
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
    throw new Error("Latest release doesn't contain a binary")
  }

  return {
    url: downloadURL,
    version: responseParsed.tag,
    binaryName: forPlatform.name
  }
}

exports.testBinary = async which => {
  // Make it executable first
  await setPermissions(which)

  // And then try to get the version
  // To see if the binary is even working
  const cmd = await exec(`${which} -v`, {
    cwd: homedir()
  })

  if (cmd.stdout) {
    const output = trimWhitespace(cmd.stdout.toString())

    if (semVer.valid(output)) {
      return
    }
  }

  throw new Error(`The downloaded binary doesn't work`)
}

exports.download = (url, binaryName, onUpdate) =>
  new Promise(async (resolve, reject) => {
    let tempDir

    try {
      tempDir = await tmp.dir({
        unsafeCleanup: true
      })
    } catch (err) {
      reject(err)
      return
    }

    ipcMain.once('online-status-changed', (event, status) => {
      if (status === 'offline') {
        const error = new Error("You wen't offline! Stopping download...")
        error.name = 'offline'

        reject(error)
      }
    })

    const binaryDownload = await fetch(url)
    const { body } = binaryDownload

    if (onUpdate) {
      let bytes = 0
      let bytesLoaded = 0
      let percentage

      if (binaryDownload && binaryDownload.headers) {
        bytes = binaryDownload.headers.get('content-length')
      } else {
        reject(new Error('Not able to get binary size'))
      }

      body.on('data', chunk => {
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
    const writeStream = fs.createWriteStream(destination)

    const stream = body.pipe(writeStream)

    stream.on('finish', () => {
      resolve({
        path: path.join(tempDir.path, binaryName),
        cleanup: tempDir.cleanup
      })
    })

    stream.on('error', reject)
  })
