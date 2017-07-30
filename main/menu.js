// Packages
const { Menu, shell } = require('electron')

// Utilities
const logout = require('./utils/logout')
const toggleWindow = require('./utils/frames/toggle')
const { getConfig } = require('./utils/config')

exports.innerMenu = async function(app, tray, windows) {
  const config = await getConfig()
  const { openAtLogin } = app.getLoginItemSettings()

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
      label: 'Options',
      submenu: [
        {
          label: 'Open at Login',
          type: 'checkbox',
          checked: openAtLogin,
          click() {
            app.setLoginItemSettings({
              openAtLogin: !openAtLogin
            })
          }
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
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
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      role: 'quit'
    }
  ])
}
