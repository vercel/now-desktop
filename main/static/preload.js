const electron = require('electron');

window.ipc = electron.ipcRenderer;

try {
  window.appPath = electron.remote.app.getAppPath();
} catch (error) {}

try {
  window.appVersion = electron.remote.app.getVersion();
} catch (error) {}

(function() {
  const { info, warn } = console;

  /* eslint-disable prefer-rest-params */

  // Hide suggestion for React DevTools, because we don't want
  // to bundle them in the application.
  console.info = message => {
    if (message.includes('Download the React DevTools')) {
      info.apply(console, arguments);
    }
  };

  // Hide warning message about loading insecure resources, since this
  // only happens while developing on http://localhost:3000.
  console.warn = message => {
    if (message.includes('Insecure Resources')) {
      warn.apply(console, arguments);
    }
  };

  /* eslint-enable prefer-rest-params */
})();
