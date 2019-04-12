const electron = require('electron');

window.ipc = electron.ipcRenderer;

(function() {
  const { info, warn } = console;

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
})();
