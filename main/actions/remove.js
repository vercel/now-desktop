// Packages
const { dialog } = require('electron')
const Cache = require('electron-config')

// Ours
const notify = require('../notify')
const { error: showError } = require('../dialogs')
const { connector } = require('../api')

module.exports = async info => {
  // Ask the user if it was an accident
  const keepIt = dialog.showMessageBox({
    type: 'question',
    title: 'Removal of ' + info.name,
    message: 'Do you really want to delete this deployment?',
    detail: info.name,
    buttons: ['Yes', 'Hell, no!']
  })

  // If so, do nothing
  if (keepIt) {
    return
  }

  // We only want to show this message if the deletion takes long
  const deletionNotice = setTimeout(() => {
    notify({
      title: `Deleting ${info.name}...`,
      body: 'The deployment is being removed from our servers.'
    })
  }, 1000)

  // Otherwise, delete the deployment
  const now = await connector()

  try {
    await now.deleteDeployment(info.uid)
  } catch (err) {
    console.error(err)
    showError('Failed to remove deployment ' + info.name)

    return
  }

  clearTimeout(deletionNotice)

  notify({
    title: 'Deleted ' + info.name,
    body: 'The deployment has successfully been deleted.'
  })

  const cache = new Cache()
  const cacheIdentifier = 'deployments'

  if (!cache.has(cacheIdentifier)) {
    return
  }

  // Get a list of all deployments
  const deployments = cache.get(cacheIdentifier)

  for (const deployment of deployments) {
    if (deployment.uid !== info.uid) {
      continue
    }

    const index = deployments.indexOf(deployment)

    // Remove deleted deployment = require( deployment list
    deployments.splice(index, 1)
  }

  // And update the list in the cache
  cache.set(cacheIdentifier, deployments)
}
