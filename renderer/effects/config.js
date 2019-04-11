import ipc from '../utils/ipc';

export default (config, setConfig) => {
  if (config) {
    return;
  }

  ipc
    .getConfig()
    .then(setConfig)
    .catch(err => {
      console.error(`Failed to retrieve config: ${err}`);
    });
};
