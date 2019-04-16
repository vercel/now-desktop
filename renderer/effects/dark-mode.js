import ipc from '../utils/ipc';

export default (darkMode, setDarkMode) => {
  const updateDarkModeStatus = (event, status) => {
    setDarkMode(typeof status === 'undefined' ? event : status);
  };

  if (darkMode === null) {
    ipc
      .getDarkModeStatus()
      .then(updateDarkModeStatus)
      .catch(err => {
        console.error(`Failed to retrieve dark mode status: ${err}`);
      });
  }

  ipc.onDarkModeStatusChange(updateDarkModeStatus);

  return () => {
    ipc.clearDarkModeStatusChange(updateDarkModeStatus);
  };
};
