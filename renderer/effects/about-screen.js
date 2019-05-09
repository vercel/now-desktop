import ipc from '../utils/ipc';

export default (_, handleAboutScreen) => {
  ipc.onAboutScreen(handleAboutScreen);

  return () => {
    ipc.clearAboutScreen(handleAboutScreen);
  };
};
