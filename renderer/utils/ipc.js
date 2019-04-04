import { timeout } from 'promise-timeout';

export const getConfig = () => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.once(
        'config-get-response',
        (event, arg) => (arg instanceof Error ? reject(arg) : resolve(arg))
      );

      window.ipc.send('config-get-request');
    }),
    1000
  );
};

export const saveConfig = (data, type, firstSave) => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.once(
        'config-save-response',
        (event, arg) => (arg instanceof Error ? reject(arg) : resolve())
      );

      window.ipc.send('config-save-request', data, type, firstSave);
    }),
    1000
  );
};

export const openURL = url => window.ipc.send('url-request', url);
export const hideWindow = () => window.ipc.send('hide-window-request');

export const getDarkModeStatus = () => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.once(
        'dark-mode-response',
        (event, arg) => (arg instanceof Error ? reject(arg) : resolve())
      );

      window.ipc.send('dark-mode-request');
    }),
    1000
  );
};
