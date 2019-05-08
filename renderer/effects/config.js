import Router from 'next/router';
import ipc from '../utils/ipc';

const loadFreshConfig = setConfig => {
  console.time('Loaded fresh config');

  ipc
    .getConfig()
    .then(config => {
      console.timeEnd('Loaded fresh config');
      if (!config || !config.token) {
        Router.replace('/login');
      }
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

  ipc.onWindowOpening(prepareOpening);

  return () => {
    ipc.clearWindowOpening(prepareOpening);
  };
};
