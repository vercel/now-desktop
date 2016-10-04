// Packages
import {dialog} from 'electron'

// Ours
import notify from '../notify'
import {error as showError} from '../dialogs'
import {connector, refreshCache} from '../api'

export default async info => {
  // Ask the user if it was an accident
  const keepIt = dialog.showMessageBox({
    type: 'question',
    title: 'Removal of ' + info.name,
    message: 'Do you really want to delete this deployment?',
    detail: info.name,
    buttons: [
      'Yes',
      'Hell, no!'
    ]
  })

  // If so, do nothing
  if (keepIt) {
    return
  }

  notify({
    title: `Deleting ${info.name}...`,
    body: 'The deployment is being removed from our servers.'
  })

  // Otherwise, delete the deployment
  const now = connector()

  try {
    await now.deleteDeployment(info.uid)
  } catch (err) {
    console.error(err)
    showError('Failed to remove deployment ' + info.name)

    return
  }

  notify({
    title: 'Deleted ' + info.name,
    body: 'The deployment has successfully been deleted.'
  })

  try {
    await refreshCache('deployments')
  } catch (err) {
    showError(err)
  }
}
