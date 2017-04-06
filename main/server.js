// Native
const { createServer } = require('http');
const { randomBytes } = require('crypto');

// Packages
const { app, session } = require('electron');
const next = require('next');
const dev = require('electron-is-dev');
const getPort = require('get-port');
const { resolve: resolvePath } = require('app-root-path');

const serverID = randomBytes(20).toString('base64');

const modifyHeaders = (details, callback) => {
  details.requestHeaders['server-id'] = serverID;

  callback({
    cancel: false,
    requestHeaders: details.requestHeaders
  });
};

const prepareServer = nextHandler =>
  createServer((req, res) => {
    if (!req.headers['server-id'] || req.headers['server-id'] !== serverID) {
      res.writeHead(403);
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

module.exports = () => {
  session.defaultSession.webRequest.onBeforeSendHeaders(modifyHeaders);

  return new Promise(async (resolve, reject) => {
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
};
