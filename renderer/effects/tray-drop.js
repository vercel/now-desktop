import ipc from '../utils/ipc';

export default (_, handleTrayDrop) => {
  ipc.onTrayDrop(handleTrayDrop);

  return () => {
    ipc.clearTrayDrop(handleTrayDrop);
  };
};
