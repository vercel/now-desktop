import ipc from '../utils/ipc';

const loadFreshConfig = setConfig => {
  console.time('Loaded fresh config');

  ipc
    .getConfig()
    .then(config => {
      console.timeEnd('Loaded fresh config');
      setConfig(config);
    })
    .catch(err => {
      console.error(`Failed to retrieve config: ${err}`);
    });
};

export default (config, setConfig) => {
  if (config === null) {
    loadFreshConfig(setConfig);
  }

  const prepareOpening = () => {
    loadFreshConfig(setConfig);
  };

  ipc.onPrepareOpening(prepareOpening);

  return () => {
    ipc.clearPrepareOpening(prepareOpening);
  };
};
