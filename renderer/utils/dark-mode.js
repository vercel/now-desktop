export default electron => {
  // Check if Windows or Mac
  const isWinOS = process.platform === 'win32';
  const isMacOS = process.platform === 'darwin';

  let darkMode = false;

  if (isMacOS) {
    darkMode = electron.systemPreferences.isDarkMode();
  } else if (isWinOS) {
    darkMode = electron.systemPreferences.isInvertedColorScheme();
  }

  return darkMode;
};
