import ipc from '../utils/ipc';

export const deploymentCreated = setActiveDeployment => {
  ipc.onDeploymentCreated(setActiveDeployment);

  return () => {
    ipc.clearDeploymentCreated(setActiveDeployment);
  };
};

export const buildStateChanged = setActiveDeployment => {
  ipc.onBuildStateChanged(setActiveDeployment);

  return () => {
    ipc.clearBuildStateChanged(setActiveDeployment);
  };
};

export const hashesCalculated = setHashesCalculated => {
  ipc.onHashesCalculated(setHashesCalculated);

  return () => {
    ipc.clearHashesCalculated(setHashesCalculated);
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
