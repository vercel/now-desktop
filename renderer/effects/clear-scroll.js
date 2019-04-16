import ipc from '../utils/ipc';

export default scrollingSection => {
  const clearScroll = () => {
    if (!scrollingSection || !scrollingSection.current) {
      return;
    }

    scrollingSection.current.scrollTop = 0;
  };

  clearScroll();
  ipc.onWindowOpening(clearScroll);

  return () => {
    ipc.clearWindowOpening(clearScroll);
  };
};
