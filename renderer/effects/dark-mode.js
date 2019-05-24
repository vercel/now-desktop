import ipc from '../utils/ipc';

export default (darkMode, setDarkMode) => {
  const updateDarkModeStatus = (event, status) => {
    setDarkMode(typeof status === 'undefined' ? event : status);
  };

  if (darkMode === null) {
    ipc
      .getDarkModeStatus()
      .then(updateDarkModeStatus)
      .catch(error => {
        console.error(`Failed to retrieve dark mode status: ${error}`);
      });
  }

  ipc.onDarkModeStatusChange(updateDarkModeStatus);

  return () => {
    ipc.clearDarkModeStatusChange(updateDarkModeStatus);
  };
};
