import { timeout } from 'promise-timeout';

export default timeout(
  new Promise((resolve, reject) => {
    window.ipc.on('config-reply', (event, config) => {
      if (config instanceof Error) {
        reject(config);
      } else {
        resolve(config);
      }
    });

    window.ipc.send('config-request');
  }),
  1000
);
