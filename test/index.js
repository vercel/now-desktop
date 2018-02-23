// Native
const { resolve } = require('path')
const { homedir } = require('os')

// Packages
const test = require('ava')
const { Application } = require('spectron')
const trim = require('trim')
const ms = require('ms')
const { remove, pathExists } = require('fs-extra')
const sleep = require('sleep-promise')

// Utilities
const changeWindow = require('./helpers/switch')
const getRandom = require('./helpers/random')

test.before(async t => {
  const app = resolve(__dirname, '../dist/mac/Now.app/Contents/MacOS/Now')
  const config = resolve(homedir(), '.now')

  // Remove the config directory to
  // simulate a new user starting the app
  if (await pathExists(config)) {
    await remove(config)
  }

  t.context = new Application({
    path: app,
    startTimeout: 10000,
    waitTimeout: 10000
  })

  await t.context.start()
})

test('make sure we have 4 windows', async t => {
  t.is(await t.context.client.getWindowCount(), 4)
})

test('switch to the tutorial window', async t => {
  t.true(await changeWindow(t.context, 'tutorial'))
})

test('enter gibberish into the login field', async t => {
  const value = getRandom()
  const selector = 'aside.login input'

  await t.context.client.setValue(selector, value)
  t.is(await t.context.client.getValue(selector), value)
})

test('submit gibberish in the login field', async t => {
  await t.context.client.keys('Enter')

  const selector = 'aside.login'
  const classes = await t.context.client.getAttribute(selector, 'class')

  t.true(classes.split(' ').includes('error'))
})

test('log in properly', async t => {
  const selector = 'aside.login input'
  const address = `${getRandom(10)}@zeit.pub`
  const { client } = t.context

  // Blur the input element and focus again
  await client.keys('Escape')
  await client.click(selector)

  const value = await client.getValue(selector)

  let movers = []
  let i = 0

  while (i < value.length) {
    movers.push(client.keys('ArrowRight'))
    i++
  }

  await Promise.all(movers)

  movers = []
  i = 0

  while (i < value.length) {
    movers.push(client.keys('Backspace'))
    i++
  }

  await Promise.all(movers)

  await client.setValue(selector, address)
  await client.keys('Enter')
  await client.waitForExist('span.sub', ms('10s'))

  const content = await client.getText('p.has-mini-spacing + a')
  t.is(trim(content.join('')), 'START TUTORIAL')
})

test('move through the tutorial', async t => {
  const next = '.slick-arrow.slick-next'
  const { client } = t.context

  let index = 0

  while (index < 3) {
    await client.click(next)
    await sleep(500)

    index++
  }

  const selector = '.slick-slide[data-index="3"] a'
  const content = await client.getText(selector)

  t.is(content, 'GET STARTED')
  t.true(await client.isVisibleWithinViewport(selector))
})

test.after.always(async t => {
  await t.context.stop()
})
