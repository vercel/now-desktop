import { timeout } from 'promise-timeout';

const openURL = url => {
  return window.ipc.send('url-request', url);
};

const hideWindow = () => {
  return window.ipc.send('hide-window-request');
};

const showWindow = () => {
  return window.ipc.send('show-window-request');
};

const openMainMenu = bounds => {
  return window.ipc.send('open-main-menu-request', bounds);
};

const openEventMenu = (bounds, spec) => {
  return window.ipc.send('open-event-menu-request', bounds, spec);
};

const onDarkModeStatusChange = invoke => {
  window.ipc.on('dark-mode-status-changed', invoke);
};

const clearDarkModeStatusChange = invoke => {
  window.ipc.removeListener('dark-mode-status-changed', invoke);
};

const onPrepareOpening = invoke => {
  window.ipc.on('prepare-opening', invoke);
};

const clearPrepareOpening = invoke => {
  window.ipc.removeListener('prepare-opening', invoke);
};

const getConfig = () => {
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

const saveConfig = (data, type, firstSave) => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.once(
        'config-save-response',
        (event, arg) => (arg instanceof Error ? reject(arg) : resolve(arg))
      );

      window.ipc.send('config-save-request', data, type, firstSave);
    }),
    1000
  );
};

const getDarkModeStatus = () => {
  return timeout(
    new Promise((resolve, reject) => {
      window.ipc.once(
        'dark-mode-response',
        (event, arg) => (arg instanceof Error ? reject(arg) : resolve(arg))
      );

      window.ipc.send('dark-mode-request');
    }),
    1000
  );
};

export default {
  openURL,
  hideWindow,
  showWindow,
  openMainMenu,
  openEventMenu,
  onDarkModeStatusChange,
  clearDarkModeStatusChange,
  onPrepareOpening,
  clearPrepareOpening,
  getConfig,
  saveConfig,
  getDarkModeStatus
};
