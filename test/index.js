// Native
const { resolve } = require('path')
const { homedir } = require('os')
const { randomBytes } = require('crypto')

// Packages
const test = require('ava')
const { Application } = require('spectron')
const trim = require('trim')
const ms = require('ms')
const { remove, pathExists, readJSON, writeJSON } = require('fs-extra')
const sleep = require('sleep-promise')
const fkill = require('fkill')

// Utilities
const changeWindow = require('./helpers/switch')
const getRandom = require('./helpers/random')

const configDir = resolve(homedir(), '.now')

const configFiles = {
  auth: resolve(configDir, 'auth.json'),
  config: resolve(configDir, 'config.json')
}

test.before(async t => {
  let configContent

  // Close the existing app
  if (!process.env.CI) {
    try {
      await fkill('Now')
    } catch (err) {}
  }

  const { auth, config } = configFiles

  // Remove the config directory to
  // simulate a new user starting the app
  if (await pathExists(configDir)) {
    configContent = {
      auth: await readJSON(auth),
      config: await readJSON(config)
    }

    await remove(configDir)
  }

  // Save it so we can put it back after the tests
  t.context.oldConfig = configContent
})

test.beforeEach(async t => {
  let suffix = '../dist/mac/Now.app/Contents/MacOS/Now'

  if (process.platform === 'win32') {
    suffix = '../dist/win-unpacked/Now.exe'
  }

  const app = resolve(__dirname, suffix)

  t.context.app = new Application({
    path: app,
    startTimeout: ms('10s'),
    waitTimeout: ms('30s')
  })

  // Spawn the application
  await t.context.app.start()
})

test('make sure we have 4 windows', async t => {
  t.is(await t.context.app.client.getWindowCount(), 4)
})

test('switch to the tutorial window', async t => {
  t.true(await changeWindow(t.context.app, 'tutorial'))
})

test('enter and submit gibberish into the login field', async t => {
  const { app } = t.context
  const value = getRandom()
  const selector = 'aside.login'
  const inputSelector = 'aside.login input'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'tutorial')

  await app.client.setValue(inputSelector, value)
  await app.client.keys('Enter')

  const classes = await app.client.getAttribute(selector, 'class')

  t.is(await app.client.getValue(inputSelector), value)
  t.true(classes.split(' ').includes('error'))
})

test('log in properly', async t => {
  const { app } = t.context
  const selector = 'aside.login input'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'tutorial')

  // Blur the input element and focus again
  await app.client.keys('Escape')
  await app.client.click(selector)

  const value = await app.client.getValue(selector)

  let movers = []
  let i = 0

  while (i < value.length) {
    movers.push(app.client.keys('ArrowRight'))
    i++
  }

  await Promise.all(movers)

  movers = []
  i = 0

  while (i < value.length) {
    movers.push(app.client.keys('Backspace'))
    i++
  }

  await Promise.all(movers)

  const id = randomBytes(20).toString('hex')
  const email = `now-desktop-${id}@zeit.pub`

  await app.client.setValue(selector, email)
  await app.client.keys('Enter')
  await app.client.waitForExist('span.sub', ms('10s'))

  const content = await app.client.getText('p.has-mini-spacing + a')
  t.is(trim(content.join('')), 'START TUTORIAL')
})

test('move through the tutorial', async t => {
  const { app } = t.context

  await app.client.waitUntilWindowLoaded(10000)
  await changeWindow(t.context.app, 'tutorial')

  let index = 0

  while (index < 3) {
    await app.client.click('.slick-next')
    await sleep(500)

    index++
  }

  const button = '.get-started'
  await app.client.waitForExist(button, ms('10s'))

  t.true(await app.client.isVisibleWithinViewport(button))
})

test('get started', async t => {
  const { app } = t.context
  const button = '.get-started'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'tutorial')

  let index = 0

  while (index < 10) {
    await app.client.click('.slick-next')
    await sleep(1000)

    try {
      await app.client.waitForExist(button, ms('5s'))
      await app.client.click(button)

      await changeWindow(t.context.app, 'feed')

      t.pass()

      break
    } catch (err) {
      index++
    }
  }

  t.fail()
})

test('dismiss tip (if any)', async t => {
  const { app } = t.context
  const tip = '.tip'
  const close = '.tip .close'

  try {
    await app.client.waitUntilWindowLoaded()
    await changeWindow(t.context.app, 'feed')

    await app.client.waitForExist(tip, ms('10s'))

    const content = await app.client.getText(tip)
    t.true(content.includes('Tip:'))
    await app.client.click(close)
  } catch (e) {
    if (e.type === 'WaitUntilTimeoutError') {
      t.pass('No tip')
    } else {
      t.fail(e.message)
    }
  }
})

test('open the event feed', async t => {
  const { app } = t.context
  const event = '.event figcaption p'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'feed')

  await app.client.waitForExist(event, ms('10s'))

  const content = await app.client.getText(event)
  t.true(content.includes('Welcome to Now'))
})

test('switch the event group', async t => {
  const { app } = t.context

  const toggler = '.toggle-filter'
  const system = '.filter nav a:last-child'
  const me = '.filter nav a:first-child'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'feed')

  await app.client.waitForExist(toggler, ms('10s'))

  await app.client.click(toggler)
  await app.client.click(system)

  t.is(await app.client.getText(system), 'System')

  // Bring it back to normal
  await app.client.click(me)
  await app.client.click(toggler)
})

test('search for something', async t => {
  const { app } = t.context

  const field = '.light aside span'
  const event = '.event figcaption p'
  const input = `${field} + [name="form"] input`

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'feed')

  await app.client.waitForExist(field, ms('10s'))
  await app.client.click(field)
  await app.client.setValue(input, 'welcome')

  await app.client.waitForExist(event, ms('10s'))

  const content = await app.client.getText(event)
  const text = `Welcome to Now`

  if (Array.isArray(content)) {
    t.truthy(content.find(item => item.includes(text)))
  } else {
    t.true(content.includes(text))
  }

  await app.client.click(`${input} + b`)
})

test('open tutorial from about window', async t => {
  const { app } = t.context
  const target = '.wrapper nav a:last-child'
  const sub = '.has-mini-spacing + a + .sub'

  await app.client.waitUntilWindowLoaded()
  await changeWindow(t.context.app, 'about')

  await app.client.waitForExist(target, ms('10s'))

  const text = await app.client.getText(target)
  t.is(text, 'Tutorial')

  await app.client.click(target)
  await changeWindow(t.context.app, 'tutorial')
  await app.client.waitForExist(sub, ms('10s'))

  t.true(await app.client.isExisting(sub))
})

test.afterEach.always(async t => {
  await t.context.app.stop()
})

test.after.always(async t => {
  const { oldConfig } = t.context

  if (!oldConfig) {
    return
  }

  const { auth, config } = oldConfig
  const options = { spaces: 2 }

  await writeJSON(configFiles.auth, auth, options)
  await writeJSON(configFiles.config, config, options)
})
