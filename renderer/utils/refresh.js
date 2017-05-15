// Packages
import electron from 'electron'

export default async () => {
  const remote = electron.remote || false

  if (!remote) {
    return
  }

  // Start periodically refreshing data after login
  remote.require('./api').startRefreshing()

  // Start checking for app and CLI updates
  remote.require('./updates')()
}
