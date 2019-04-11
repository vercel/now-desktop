export default (online, setOnline) => {
  const updateOnlineStatus = () => {
    setOnline(navigator.onLine);
  };

  if (online === null) {
    updateOnlineStatus();
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};
