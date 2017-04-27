// Utilities
import remote from './electron'

export default async () => {
  // Start periodically refreshing data after login
  remote.require('./api').startRefreshing()

  // Start checking for app and CLI updates
  remote.require('./updates')()
}
