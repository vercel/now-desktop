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

test('enter gibberish into the login field', async t => {
  const { random } = Math
  const value = random()
    .toString(36)
    .split('.')[1]
  const selector = 'aside.login input'

  await changeWindow(t.context, 'tutorial')
  await t.context.client.setValue(selector, value)

  t.is(await t.context.client.getValue(selector), value)
})

test('submit gibberish in the login field', async t => {
  await t.context.client.keys('Enter')

  const selector = 'aside.login'
  const classes = await t.context.client.getAttribute(selector, 'class')

  t.true(classes.split(' ').includes('error'))
})

test.after.always(async t => {
  await new Promise(resolve => setTimeout(resolve, 5000))
  await t.context.stop()
})
