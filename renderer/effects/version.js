import ipc from '../utils/ipc';

export default (_, setLatestVersion) => {
  ipc
    .checkLatestVersion()
    .then(setLatestVersion)
    .catch(err => {
      console.error(`Failed to fetch latest version: ${err}`);
    });

  ipc.onLatestVersionCheck(setLatestVersion);

  return () => {
    ipc.clearLatestVersionCheck(setLatestVersion);
  };
};
