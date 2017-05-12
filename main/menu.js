// Packages
const { Menu, shell, clipboard } = require('electron')
const moment = require('moment')

// Ours
const logout = require('./actions/logout')
const removeDeployment = require('./actions/remove')
const notify = require('./notify')
const toggleWindow = require('./utils/frames/toggle')
const { get: getConfig } = require('./utils/config')

exports.deploymentOptions = info => {
  const created = moment(new Date(parseInt(info.created, 10)))
  const submenu = []

  // Incomplete deployments have this field set to `null`
  if (info.url) {
    const url = 'https://' + info.url

    submenu.push(
      {
        label: 'Open in Browser...',
        click: () => shell.openExternal(url)
      },
      {
        type: 'separator'
      },
      {
        label: 'Copy URL to Clipboard',
        click() {
          clipboard.writeText(url)

          // Let the user know
          notify({
            title: 'Copied to Clipboard',
            body: 'Your clipboard now contains the URL of your deployment.',
            url
          })
        }
      },
      {
        label: 'Copy ID to Clipboard',
        click() {
          clipboard.writeText(info.uid)

          // Let the user know
          notify({
            title: 'Copied to Clipboard',
            body: 'Your clipboard now contains the ID of your deployment.',
            url
          })
        }
      },
      {
        type: 'separator'
      }
    )
  }

  submenu.push(
    {
      label: 'Delete...',
      async click() {
        await removeDeployment(info)
      }
    },
    {
      type: 'separator'
    },
    {
      label: created.format('[Created on] MMM Do YYYY, h:mm a'),
      enabled: false
    }
  )

  return {
    label: info.url || 'Incomplete Deployment',
    submenu
  }
}

exports.innerMenu = async function(app, tray, data, windows) {
  let hasDeployments = false

  if (Array.isArray(data.deployments) && data.deployments.length > 0) {
    hasDeployments = true

    // Here we make sure we don't show any extra separators in the beginning/enabled
    // of the deployments list. macOS will just ignore them, but Windows will show them
    if (data.deployments[0].type === 'separator') {
      data.deployments.shift()
    }

    if (data.deployments[data.deployments.length - 1].type === 'separator') {
      data.deployments.pop()
    }
  }

  const config = await getConfig()

  return [
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
      label: 'Deployments',

      // We need this because electron otherwise keeps the item alive
      // Even if the submenu is just an empty array
      type: hasDeployments ? 'submenu' : 'normal',

      submenu: hasDeployments ? data.deployments : [],
      visible: hasDeployments
    },
    (hasDeployments && { type: 'separator' }) || { visible: false },
    {
      label: 'Account',
      submenu: [
        {
          label: config.user.email || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Username',
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
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      click: app.quit,
      role: 'quit'
    }
  ]
}

exports.outerMenu = (app, windows) =>
  Menu.buildFromTemplate([
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
