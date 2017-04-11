// Packages
const fs = require('fs');
const next = require('next');
const dev = require('electron-is-dev');
const { resolve: resolvePath } = require('app-root-path');
const { Router } = require('electron-routes');

const router = new Router('next');

const render = require('next/dist/server/render');

render.serveStatic = (req, res, path) => {
  fs.readFile(path, (err, buffer) => {
    if (err) return res.notFound();
    res.send(buffer);
  });
};

module.exports = async () => {
  const dir = resolvePath('./renderer');
  const nextApp = next({ dev, dir });
  const nextHandler = nextApp.getRequestHandler();

  await nextApp.prepare();

  router.use('app/*', (req, res) => {
    req.url = req.url.replace(/\/$/, '');
    return nextHandler(req, res);
  });
};
