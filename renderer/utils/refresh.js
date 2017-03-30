// Utilities
import remote from './electron';

export default async currentWindow => {
  // Prepare data
  const refreshCache = remote.getGlobal('refreshCache');
  await refreshCache(null, remote.app, currentWindow);

  // Start periodically refreshing data after login
  remote.getGlobal('startRefresh')(currentWindow);

  // Immediately after logging in, we start checking
  // for updates
  remote.getGlobal('autoUpdater')();
};
