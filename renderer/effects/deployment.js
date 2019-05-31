import ipc from '../utils/ipc';

export const deploymentStateChanged = setActiveDeployment => {
  ipc.onDeploymentCreated(setActiveDeployment);
  ipc.onDeploymentStateChanged(setActiveDeployment);

  return () => {
    ipc.clearDeploymentCreated(setActiveDeployment);
    ipc.clearDeploymentStateChanged(setActiveDeployment);
  };
};

export const buildStateChanged = setActiveDeployment => {
  ipc.onDeploymentStateChanged(setActiveDeployment);

  return () => {
    ipc.clearDeploymentStateChanged(setActiveDeployment);
  };
};

export const filesUploaded = setFilesUploaded => {
  ipc.onAllFilesUploaded(setFilesUploaded);

  return () => {
    ipc.clearAllFilesUploaded(setFilesUploaded);
  };
};

export const ready = handleReady => {
  ipc.onDeploymentReady(handleReady);

  return () => {
    ipc.clearDeploymentReady(handleReady);
  };
};

export const error = handleError => {
  ipc.onDeploymentError(handleError);

  return () => {
    ipc.clearDeploymentError(handleError);
  };
};
