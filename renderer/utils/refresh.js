// Utilities
import remote from './electron';

export default async currentWindow => {
  // Prepare data
  const { refreshCache } = remote.require('./api');
  await refreshCache(null, remote.app, currentWindow);

  // Start periodically refreshing data after login
  const startRefreshing = remote.getGlobal('startRefresh');
  await startRefreshing(currentWindow);

  // Start checking for app and CLI updates
  remote.require('./updates')();
};
