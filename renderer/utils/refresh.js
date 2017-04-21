// Utilities
import remote from './electron'

export default async () => {
  const { refreshCache } = remote.require('./api')

  // Load globals
  const startRefreshing = remote.getGlobal('startRefresh')
  const windows = remote.getGlobal('windows')

  // Refresh the cache
  await refreshCache(null, remote.app, windows)

  // Start periodically refreshing data after login
  await startRefreshing(windows)

  // Start checking for app and CLI updates
  remote.require('./updates')()
}
