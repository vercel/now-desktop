import electron from 'electron';

export default electron.remote;

if (typeof document === 'undefined') {
  electron.getGlobal = name => global[name];
  electron.require = require;
  electron.process = process;

  module.exports = electron;
}
