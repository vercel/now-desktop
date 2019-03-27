const { Menu: { buildFromTemplate }, shell } = require('electron')
const isDev = require('electron-is-dev')
const binaryUtils = require('./binary')

exports.innerMenu = async function(app, tray, window, inRenderer) {
  const { openAtLogin } = app.getLoginItemSettings()
  const desktop = {}
  const isCanary = true

  let updateCLI = true

  // This check needs to be explicit (updates should be
  // enabled by default if the config property is not set)
  if (desktop && desktop.updateCLI === false) {
    updateCLI = false
  }

  // We have to explicitly add a "Main" item on linux, otherwise
  // there would be no way to toggle the main window
  const prependItems =
    process.platform === 'linux'
      ? [
          {
            label: 'Main',
            click() {
              console.log('test')
            }
          }
        ]
      : []

  return buildFromTemplate(
    prependItems.concat(
      [
        {
          label:
            process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
          click() {
            console.log('test')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Account',
          submenu: [
            {
              label: 'Your Account',
              enabled: false
            },
            {
              type: 'separator'
            },
            {
              label: 'Set Username',
              click() {
                shell.openExternal('https://zeit.co/account')
              }
            },
            {
              label: 'Billing',
              click() {
                shell.openExternal('https://zeit.co/account/billing')
              }
            },
            {
              label: 'Plan',
              click() {
                shell.openExternal('https://zeit.co/account/plan')
              }
            },
            {
              label: 'API Tokens',
              click() {
                shell.openExternal('https://zeit.co/account/tokens')
              }
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Support',
          click() {
            shell.openExternal('https://zeit.chat')
          }
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal('https://zeit.co/docs')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences',
          submenu: [
            {
              label: 'Launch at Login',
              type: 'checkbox',
              checked: openAtLogin,
              enabled: !isDev,
              click() {
                app.setLoginItemSettings({
                  openAtLogin: !openAtLogin
                })
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Canary Releases',
              type: 'checkbox',
              checked: isCanary,
              click() {
                console.log('test')
              }
            },
            {
              label: 'Auto-Update Now CLI',
              type: 'checkbox',
              checked: updateCLI,
              click() {
                if (updateCLI === false) {
                  binaryUtils.install().catch(err => {
                    console.error(err)
                  })
                }

                console.log('test')
              }
            }
          ]
        },
        inRenderer
          ? null
          : {
              type: 'separator'
            },
        // This is much better than using `visible` because
        // it does not affect the width of the menu.
        inRenderer
          ? null
          : {
              label: 'Open Developer Tools',
              click() {
                window.webContents.openDevTools()
              },
              accelerator: 'Cmd+I'
            },
        {
          type: 'separator'
        },
        {
          role: 'quit',
          accelerator: 'Cmd+Q'
        }
      ].filter(Boolean)
    )
  )
}

exports.outerMenu = (app, window) =>
  buildFromTemplate([
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        console.log('test')
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Open Developer Tools',
      click() {
        window.webContents.openDevTools()
      },
      accelerator: 'Cmd+I'
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
