import ipc from '../utils/ipc';

export default (_, handleTrayDrag) => {
  ipc.onTrayDrag(handleTrayDrag);

  return () => {
    ipc.clearTrayDrag(handleTrayDrag);
  };
};
