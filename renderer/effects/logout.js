import ipc from '../utils/ipc';

export default (_, handleLogout) => {
  ipc.onLoggedOut(handleLogout);

  return () => {
    ipc.clearLoggedOut(handleLogout);
  };
};
