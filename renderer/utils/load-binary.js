// Native
import { homedir } from 'os'

// Packages
import electron from 'electron'

// Utilities
import showError from './error'

const npmInstalled = async exec => {
  try {
    // Check if we're able to get the version of the local npm instance
    // If we're not, it's not installed
    await exec('npm -v', {
      cwd: homedir()
    })
  } catch (err) {
    console.log(err)
    return false
  }

  return true
}

const loadfromNPM = async (section, exec) => {
  try {
    // Check if we're able to get the version of the local npm instance
    // If we're not, it's not installed
    await exec('npm install -g now', {
      cwd: homedir()
    })
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    })

    showError('Not able to download the latest binary using npm', err)
  }
}

const loadBundled = async (section, utils) => {
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

  let tempLocation

  try {
    tempLocation = await utils.download(
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
    await utils.handleExisting(tempLocation.path)
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    })

    showError('Not able to move binary', err)
    return
  }

  return tempLocation
}

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

  const { exec } = remote.require('child-process-promise')
  const npmExists = await npmInstalled(exec)

  let tempLocation

  if (npmExists) {
    await loadfromNPM(section, exec)
  } else {
    tempLocation = await loadBundled(section, utils)
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
  if (tempLocation) {
    tempLocation.cleanup()
  }
}
