// Packages
const { Menu, shell } = require('electron')

// Utilities
const logout = require('./utils/logout')
const toggleWindow = require('./utils/frames/toggle')
const { getConfig, saveConfig } = require('./utils/config')

exports.innerMenu = async function(app, tray, windows) {
  const config = await getConfig()
  const { openAtLogin } = app.getLoginItemSettings()
  const { updateChannel } = config
  const isCanary = updateChannel && updateChannel === 'canary'

  return Menu.buildFromTemplate([
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        toggleWindow(null, windows.about)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Account',
      submenu: [
        {
          label: config.user.username || config.user.email,
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: config.user.username ? 'Change Username' : 'Set Username',
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
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          click: logout
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
          click() {
            app.setLoginItemSettings({
              openAtLogin: !openAtLogin
            })
          }
        },
        {
          label: 'Canary Updates',
          type: 'checkbox',
          checked: isCanary,
          click() {
            saveConfig(
              {
                updateChannel: isCanary ? 'stable' : 'canary'
              },
              'config'
            )
          }
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
}

exports.outerMenu = (app, windows) => {
  return Menu.buildFromTemplate([
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        toggleWindow(null, windows.about)
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
}
