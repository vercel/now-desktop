// Utilities
import showError from './error';
import remote from './electron';

// Load from main process
const utils = remote.require('./utils/binary');

export default async section => {
  if (section) {
    section.setState({
      installing: true,
      downloading: true
    });
  }

  let downloadURL;

  try {
    downloadURL = await utils.getURL();
  } catch (err) {
    showError('Not able to get URL of latest binary', err);
    return;
  }

  const location = await utils.download(
    downloadURL.url,
    downloadURL.binaryName
  );

  if (section) {
    section.setState({
      downloading: false
    });
  }

  try {
    await utils.handleExisting(location.path);
  } catch (err) {
    section.setState({
      installing: false,
      done: false
    });

    showError('Not able to move binary', err);
    return;
  }

  // Let the user know where finished
  if (section) {
    section.setState({
      installing: false,
      done: true
    });
  }

  // Remove temporary directory
  location.cleanup();
};
