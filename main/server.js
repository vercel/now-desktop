// Native
const { createServer } = require('http');

// Packages
const { app } = require('electron');
const next = require('next');
const dev = require('electron-is-dev');
const getPort = require('get-port');
const { resolve: resolvePath } = require('app-root-path');

const prepareServer = nextHandler =>
  createServer((req, res) => {
    if (req.headers['user-agent'].indexOf('Electron') === -1) {
      res.writeHead(404);
      res.end();

      return;
    }

    res.setHeader('Access-Control-Request-Method', 'GET');

    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    return nextHandler(req, res);
  });

module.exports = () =>
  new Promise(async (resolve, reject) => {
    const dir = resolvePath('./renderer');
    const nextApp = next({ dev, dir });
    const nextHandler = nextApp.getRequestHandler();

    await nextApp.prepare();

    const server = prepareServer(nextHandler);
    const freePort = await getPort();

    server.listen(freePort, error => {
      if (error) {
        reject(error);
        return;
      }

      app.on('quit', () => server.close());
      resolve(freePort);
    });
  });
