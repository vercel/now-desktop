// Native
const fs = require('fs')
const { createServer } = require('http')

// Packages
const { app } = require('electron')
const next = require('next')
const dev = require('electron-is-dev')
const { resolve } = require('app-root-path')

let router

if (!dev) {
  const { Router } = require('electron-routes')
  const render = require('next/dist/server/render')

  router = new Router('next')

  render.serveStatic = (req, res, path) => {
    fs.readFile(path, (err, buffer) => {
      if (err) return res.notFound()
      res.send(buffer)
    })
  }
}

module.exports = async () => {
  const dir = resolve('./renderer')
  const nextApp = next({ dev, dir })
  const nextHandler = nextApp.getRequestHandler()

  // Build the renderer code and watch the files
  await nextApp.prepare()

  // In production, take advantage of `electron-router`
  if (!dev) {
    router.use('app/*', (req, res) => {
      req.url = req.url.replace(/\/$/, '')
      return nextHandler(req, res)
    })

    return
  }

  // But if developing the application, create a
  // new native HTTP server (which supports hot code reloading)
  const server = createServer(nextHandler)

  server.listen(8000, () => {
    // Make sure to stop the server when the app closes
    // Otherwise it keeps running on its own
    app.on('before-quit', () => server.close())
  })
}
