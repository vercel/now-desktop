// Packages
import {remote} from 'electron'

// Ours
import showError from './error'

// Load from main process
const sudo = remote.require('sudo-prompt')

export default async section => {
  const utils = remote.getGlobal('binaryUtils')
  const resolvePath = remote.require('app-root-path').resolve

  if (section) {
    section.setState({
      installing: true,
      downloading: true
    })
  }

  const downloadURL = await utils.getURL()
  const location = await utils.download(downloadURL.url, downloadURL.binaryName)

  if (section) {
    section.setState({
      downloading: false
    })
  }

  const destination = utils.getPath()
  const isWindows = /Windows/.test(navigator.userAgent)
  const mvCommand = isWindows ? 'move' : 'mv'
  const suffix = utils.getBinarySuffix()
  const command = `${mvCommand} ${location.path} ${destination}/now${suffix}`

  // If there's an existing binary, rename it
  try {
    await utils.handleExisting()
  } catch (err) {}

  const sudoOptions = {
    name: 'Now',
    icns: resolvePath('/dist/icons/icon.icns')
  }

  sudo.exec(command, sudoOptions, async error => {
    if (error) {
      section.setState({
        installing: false,
        done: false
      })

      showError('Not able to move binary', error.toString())
      return
    }

    // Copy permissions of node binary
    try {
      await utils.setPermissions(destination)
    } catch (err) {
      console.error(err)
    }

    try {
      await utils.ensurePath()
    } catch (err) {
      showError(err.message, err.toString())
    }

    // Let the user know where finished
    if (section) {
      section.setState({
        installing: false,
        done: true
      })
    }

    // Remove temporary directory
    location.cleanup()
  })
}
