import electron from 'electron';

export default electron.remote;

if (typeof document === 'undefined') {
  electron.getGlobal = name => global[name];
  electron.require = require;

  module.exports = electron;
}
