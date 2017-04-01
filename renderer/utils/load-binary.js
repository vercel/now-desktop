// Utilities
import showError from './error';
import remote from './electron';

// Load from main process
const sudo = remote.require('sudo-prompt');
const { resolve: resolvePath } = remote.require('app-root-path');
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

  const destination = utils.getPath();
  const isWindows = /Windows/.test(navigator.userAgent);
  const mvCommand = isWindows ? 'move' : 'mv';
  const suffix = utils.getBinarySuffix();
  const command = `${mvCommand} ${location.path} ${destination}/now${suffix}`;

  // If there's an existing binary, rename it
  try {
    await utils.handleExisting();
  } catch (err) {}

  const sudoOptions = {
    name: 'Now',
    icns: resolvePath('./main/static/icons/mac.icns')
  };

  sudo.exec(command, sudoOptions, async error => {
    if (error) {
      section.setState({
        installing: false,
        done: false
      });

      showError('Not able to move binary', error.toString());
      return;
    }

    // Copy permissions of node binary
    try {
      await utils.setPermissions(destination);
    } catch (err) {
      console.error(err);
    }

    try {
      await utils.ensurePath();
    } catch (err) {
      showError(err.message, err.toString());
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
  });
};
