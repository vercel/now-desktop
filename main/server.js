// Packages
const next = require('next');
const dev = require('electron-is-dev');
const { resolve: resolvePath } = require('app-root-path');
const { Router } = require('@marshallofsound/electron-router');

const router = new Router('next');

module.exports = async () => {
  const dir = resolvePath('./renderer');
  const nextApp = next({ dev, dir });
  const nextHandler = nextApp.getRequestHandler();

  await nextApp.prepare();

  router.use('*', (req, res) => {
    return nextHandler(req, res);
  });
};
