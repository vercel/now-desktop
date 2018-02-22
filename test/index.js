// Native
const { resolve } = require('path')

// Packages
const test = require('ava')
const { Application } = require('spectron')

// Utilities
const changeWindow = require('./helpers/switch')

test.before(async t => {
  const path = resolve(__dirname, '../dist/mac/Now.app/Contents/MacOS/Now')

  t.context = new Application({
    path,
    startTimeout: 10000,
    waitTimeout: 10000
  })

  await t.context.start()
})

test('make sure we have 4 windows', async t => {
  t.is(await t.context.client.getWindowCount(), 4)
})

test('switch to tutorial window', async t => {
  t.true(await changeWindow(t.context, 'tutorial'))
})

test.after.always(async t => {
  await t.context.stop()
})
