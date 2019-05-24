import Router from 'next/router';
import ipc from '../utils/ipc';

const loadFreshConfig = setConfig => {
  console.time('Loaded fresh config');

  ipc
    .getConfig()
    .then(config => {
      console.timeEnd('Loaded fresh config');

      if (!config || !config.token) {
        const loginPath = window.location.href.includes('http')
          ? '/login'
          : `${window.appPath}/renderer/out/login/index.html`;
        Router.replace(loginPath);
      }

      setConfig(config);
    })
    .catch(error => {
      console.error(`Failed to retrieve config: ${error}`);
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
