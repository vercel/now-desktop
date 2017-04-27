// Utilities
import remote from './electron'

export default async () => {
  const startRefreshing = remote.getGlobal('startRefresh')

  // Start periodically refreshing data after login
  await startRefreshing()

  // Start checking for app and CLI updates
  remote.require('./updates')()
}
