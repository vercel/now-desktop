// Native
const { createServer } = require('http')

// Packages
const { app } = require('electron')
const next = require('next')
const { resolve } = require('app-root-path')

module.exports = async () => {
  const dir = resolve('./renderer')
  const nextApp = next({ dev: true, dir })
  const nextHandler = nextApp.getRequestHandler()

  // Build the renderer code and watch the files
  await nextApp.prepare()

  // But if developing the application, create a
  // new native HTTP server (which supports hot code reloading)
  const server = createServer(nextHandler)

  server.listen(8000, () => {
    // Make sure to stop the server when the app closes
    // Otherwise it keeps running on its own
    app.on('before-quit', () => server.close())
  })
}
