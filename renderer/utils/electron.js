import electron from 'electron';
import path from 'path';

export default electron.remote;

if (typeof document === 'undefined') {
  electron.getGlobal = name => global[name];
  electron.process = process;

  electron.require = which => {
    if (which.charAt(0) === '.') {
      return require(path.join(process.cwd(), 'main', which));
    }

    return require(which);
  };

  module.exports = electron;
}
