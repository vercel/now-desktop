// Packages
import electron from 'electron'

// Utilities
import showError from './error'

export default async section => {
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

  if (section) {
    section.setState({
      installing: true,
      downloading: true
    })
  }

  let downloadURL

  try {
    downloadURL = await utils.getURL()
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    })

    showError('Not able to get URL of latest binary', err)
    return
  }

  const onUpdate = progress => {
    section.setState({ progress })
  }

  let location

  try {
    location = await utils.download(
      downloadURL.url,
      downloadURL.binaryName,
      onUpdate
    )
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    })

    if (err instanceof Error && err.name && err.name === 'offline') {
      showError(err.message)
      return
    }

    showError('Could not download binary', err)
    return
  }

  if (section) {
    section.setState({
      downloading: false
    })
  }

  try {
    await utils.handleExisting(location.path)
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    })

    showError('Not able to move binary', err)
    return
  }

  // Let the user know we're finished
  if (section) {
    section.setState({
      installing: false,
      done: true
    })
  }

  notify({
    title: 'Finished Installing now CLI',
    body: 'You can now use `now` from the command line.'
  })

  // Remove temporary directory
  location.cleanup()
}
