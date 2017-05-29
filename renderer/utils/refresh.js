// Packages
import electron from 'electron'

export default async () => {
  const remote = electron.remote || false

  if (!remote) {
    return
  }

  // Start checking for app and CLI updates
  remote.require('./updates')()
}
