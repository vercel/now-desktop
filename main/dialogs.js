// Packages
const { dialog } = require('electron');

const showDialog = details => {
  const filePath = dialog.showOpenDialog(details);

  if (filePath) {
    return filePath[0];
  }

  return false;
};

exports.share = async function(
  tray,
  properties = ['openDirectory', 'openFile']
) {
  const info = {
    title: 'Select something to share',
    properties,
    buttonLabel: 'Share'
  };

  console.log(properties);
  tray.setHighlightMode('always');
  const path = showDialog(info);
  tray.setHighlightMode('never');

  if (!path) {
    return;
  }

  const sharing = require('./actions/share');

  try {
    await sharing(path);
  } catch (err) {
    exports.error('Not able to share', err);
  }
};

exports.deploy = async function(tray) {
  const info = {
    title: 'Select a folder to deploy',
    properties: ['openDirectory'],
    buttonLabel: 'Deploy'
  };

  tray.setHighlightMode('always');
  const path = showDialog(info);
  tray.setHighlightMode('never');

  if (path) {
    const deployment = require('./actions/deploy');

    try {
      await deployment(path);
    } catch (err) {
      exports.error('Not able to deploy', err);
    }
  }
};

exports.error = function(detail, trace, win) {
  dialog.showMessageBox(win || null, {
    type: 'error',
    message: 'An Error Occurred',
    detail,
    buttons: []
  });
};
