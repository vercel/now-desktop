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
  let suffix = '../dist/mac/Now.app/Contents/MacOS/Now'
  let configContent

  if (process.platform === 'win32') {
    suffix = '../dist/win-unpacked/Now.exe'
  }

  // Close the existing app
  if (!process.env.CI) {
    try {
      await fkill('Now')
    } catch (err) {}
  }

  const app = resolve(__dirname, suffix)
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

  t.context = new Application({
    path: app,
    startTimeout: ms('10s'),
    waitTimeout: ms('30s')
  })

  // Save it so we can put it back after the tests
  t.context.oldConfig = configContent

  // Spawn the application
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

  const email = `now-desktop-${randomBytes(20)}@zeit.pub`

  await client.setValue(selector, email)
  await client.keys('Enter')
  await client.waitForExist('span.sub', ms('10s'))

  const content = await client.getText('p.has-mini-spacing + a')
  t.is(trim(content.join('')), 'START TUTORIAL')
})

test('move through the tutorial', async t => {
  const { client } = t.context
  let index = 0

  while (index < 3) {
    await client.click('.slick-next')
    await sleep(500)

    index++
  }

  const button = '.get-started'
  await client.waitForExist(button, ms('10s'))

  t.is(await client.getText(button), 'GET STARTED')
  t.true(await client.isVisibleWithinViewport(button))
})

test('open the event feed', async t => {
  const { client } = t.context
  const button = '.get-started'
  const event = '.event figcaption p'

  await client.click(button)
  await changeWindow(t.context, 'feed')
  await client.waitForExist(event, ms('10s'))

  const content = await client.getText(event)
  t.true(content[0].includes('You logged in from Now Desktop'))
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

  await client.waitForExist(field, ms('10s'))
  await client.click(field)
  await client.setValue(input, 'logged in')

  await client.waitForExist(event, ms('10s'))

  const content = await client.getText(event)
  const text = `You logged in from Now Desktop`

  if (Array.isArray(content)) {
    t.truthy(content.find(item => item.includes(text)))
  } else {
    t.true(content.includes(text))
  }

  await client.click(`${input} + b`)
})

test('open tutorial from about window', async t => {
  const { client } = t.context
  const target = '.wrapper nav a:last-child'
  const sub = '.has-mini-spacing + a + .sub'

  await changeWindow(t.context, 'about')
  await client.waitForExist(target, ms('10s'))

  const text = await client.getText(target)
  t.is(text, 'Tutorial')

  await client.click(target)
  await changeWindow(t.context, 'tutorial')
  await client.waitForExist(sub, ms('10s'))

  t.true(await client.isExisting(sub))
})

test.after.always(async t => {
  await t.context.stop()
  const { oldConfig } = t.context

  if (!oldConfig) {
    return
  }

  const { auth, config } = oldConfig
  const options = { spaces: 2 }

  await writeJSON(configFiles.auth, auth, options)
  await writeJSON(configFiles.config, config, options)
})
