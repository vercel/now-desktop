// Packages
import {remote} from 'electron'

// Ours
import showError from './error'

// Load from main process
const sudo = remote.require('sudo-prompt')

export default async section => {
  const utils = remote.getGlobal('binaryUtils')

  if (section) {
    section.setState({
      installing: true,
      downloading: true
    })
  }

  const downloadURL = await utils.getURL()
  const location = await utils.download(downloadURL.url)

  if (section) {
    section.setState({
      downloading: false
    })
  }

  const destination = utils.getPath()
  const command = 'mv ' + location.path + ' ' + destination + '/now'

  // If there's an existing binary, rename it
  try {
    await utils.handleExisting()
  } catch (err) {}

  const sudoOptions = {
    name: 'Now'
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
    await utils.setPermissions(destination)

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
