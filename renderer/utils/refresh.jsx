// Packages
import {remote} from 'electron'

const refreshCache = remote.getGlobal('refreshCache')

export default async currentWindow => {
  // Prepare data
  await refreshCache(null, remote.app, currentWindow)

  // Start periodically refreshing data after login
  remote.getGlobal('startRefresh')(currentWindow)

  const isDev = remote.getGlobal('isDev')

  // Immediately after logging in, we start checking
  // for updates
  if (!isDev && remote.process.platform !== 'linux') {
    remote.getGlobal('autoUpdater')(remote.app)
  }
}
