// Packages
import electron from 'electron'

// Utilities
import showError from './error'

const loadBundled = async (section, utils) => {
  const downloadURL = await utils.getURL()

  const onUpdate = progress => {
    section.setState({ progress })
  }

  let tempLocation

  try {
    tempLocation = await utils.download(
      downloadURL.url,
      downloadURL.binaryName,
      onUpdate
    )
  } catch (err) {
    if (err instanceof Error && err.name && err.name === 'offline') {
      throw new Error(err.message)
    }

    throw new Error('Could not download binary')
  }

  if (section) {
    section.setState({
      downloading: false
    })
  }

  // Check if the binary is working before moving it into place
  try {
    await utils.testBinary(tempLocation.path)
  } catch (err) {
    tempLocation.cleanup()
    throw err
  }

  try {
    await utils.handleExisting(tempLocation.path)
  } catch (err) {
    throw new Error('Not able to move binary')
  }

  return tempLocation
}

export default async function() {
  const remote = electron.remote || false

  if (!remote) {
    return
  }

  const onlineStatus = remote.process.env.CONNECTION

  if (onlineStatus && onlineStatus === 'offline') {
    showError("Could not download binary. You're offline!")
    return
  }

  const utils = remote.require('./utils/binary')
  const notify = remote.require('./notify')

  this.setState({
    installing: true,
    downloading: true
  })

  let tempLocation

  // Prepare progress bar (make it show up)
  this.setState({
    progress: 0
  })

  try {
    tempLocation = await loadBundled(this, utils)
  } catch (err) {
    this.setState({
      installing: false,
      done: false
    })

    showError('Could not install binary', err)
    return
  }

  // Let the user know we're finished
  this.setState({
    installing: false,
    done: true
  })

  notify({
    title: 'Finished Installing now CLI',
    body: 'You can now use `now` from the command line.'
  })

  // Remove temporary directory
  tempLocation.cleanup()
}
