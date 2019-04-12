import ipc from '../utils/ipc';

const loadFreshConfig = (setConfig, preparingOpening) => {
  console.time('Loaded fresh config');

  ipc
    .getConfig()
    .then(config => {
      const copy = Object.assign({}, config, {
        lastUpdate: Date.now()
      });

      console.timeEnd('Loaded fresh config');

      setConfig(copy);

      if (preparingOpening) {
        ipc.showWindow();
        console.log('[a] Opened window');
      }
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
    console.log('[a] Triggered opening preparation');
    loadFreshConfig(setConfig, true);
  };

  ipc.onPrepareOpening(prepareOpening);

  return () => {
    ipc.clearPrepareOpening(prepareOpening);
  };
};
