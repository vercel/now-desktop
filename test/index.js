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

const isWin = process.platform === 'win32'

test.before(async t => {
  let suffix = '../dist/mac/Now.app/Contents/MacOS/Now'

  if (isWin) {
    suffix = '../dist/win-unpacked/Now.exe'
  }

  const app = resolve(__dirname, suffix)
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

  await client.setValue(selector, 'now-desktop@zeit.pub')
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

test('open the event feed', async t => {
  const { client } = t.context
  const button = '.slick-slide[data-index="3"] a'
  const event = '.event figcaption p'

  await client.click(button)
  await changeWindow(t.context, 'feed')
  await client.waitForVisible(event, ms('10s'))

  const content = await client.getText(event)
  const os = isWin ? 'Windows' : 'macOS'

  t.is(content[0], `You logged in from Now Desktop on ${os}`)
})

test('switch the event group', async t => {
  const { client } = t.context

  const toggler = '.toggle-filter'
  const system = '.filter nav a:last-child'
  const me = '.filter nav a:first-child'

  await client.click(toggler)
  await client.click(system)

  t.is(await client.getText(system), 'System')

  // Bring it back to normal
  await client.click(me)
  await client.click(toggler)
})

test('search for something', async t => {
  const { client } = t.context

  const field = '.light aside span'
  const event = '.event figcaption p'
  const input = `${field} + [name="form"] input`

  await client.click(field)
  await client.setValue(input, 'logged in')

  await new Promise(resolve => setTimeout(resolve, 10000))

  const content = await client.getText(event)
  const os = isWin ? 'Windows' : 'macOS'
  const text = `You logged in from Now Desktop on ${os}`

  if (Array.isArray(content)) {
    t.truthy(content.find(text => text.includes(text)))
  } else {
    t.true(content.includes(text))
  }

  await client.click(`${input} + b`)
})

test('open tutorial from about window', async t => {
  const { client } = t.context
  await changeWindow(t.context, 'about')

  const target = '.wrapper nav a:last-child'
  const text = await client.getText(target)

  t.is(text, 'Tutorial')

  await client.click(target)
  await changeWindow(t.context, 'tutorial')

  t.true(await client.isExisting('.has-mini-spacing + a + .sub'))
})

test.after.always(async t => {
  await t.context.stop()
})
