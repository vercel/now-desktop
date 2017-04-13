// Native
import path from 'path'

// Packages
import test from 'ava'
import { Application } from 'spectron'

let app
let pathToBinary

switch (process.platform) {
  case 'darwin':
    pathToBinary = path.join(
      __dirname,
      '../dist/mac/Now.app/Contents/MacOS/Now'
    )
    break

  case 'win32':
    pathToBinary = path.join(__dirname, '../dist/win-unpacked/Now.exe')
    break

  default:
    throw new Error(
      'Path to the built binary needs to be defined for this platform in test/index.js'
    )
}

test.before(async () => {
  app = new Application({
    path: pathToBinary,
    env: {
      TESTING: true
    }
  })

  await app.start()
})

test.after(async () => {
  await app.stop()
})

test('check window count', async t => {
  await app.client.waitUntilWindowLoaded()
  t.is(await app.client.getWindowCount(), 4)
})

test('see if dev tools are open', async t => {
  await app.client.waitUntilWindowLoaded()
  t.false(await app.browserWindow.isDevToolsOpened())
})
