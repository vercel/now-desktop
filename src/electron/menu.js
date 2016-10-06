// Packages
import {shell, clipboard} from 'electron'
import moment from 'moment'
import Config from 'electron-config'

// Ours
import {deploy, share} from './dialogs'
import logout from './actions/logout'
import removeDeployment from './actions/remove'
import notify from './notify'
import toggleWindow from './utils/toggle-window'

export function deploymentOptions(info) {
  const created = moment(new Date(parseInt(info.created, 10)))
  const url = 'https://' + info.url

  return {
    label: info.url,
    submenu: [
      {
        label: 'Open in Browser...',
        click: () => shell.openExternal(url)
      },
      {
        label: 'Copy URL to Clipboard',
        click() {
          clipboard.writeText(url)

          // Let the user know
          notify({
            title: 'Copied to clipboard',
            body: 'Your clipboard now contains the URL of your deployment.',
            url
          })
        }
      },
      {
        type: 'separator'
      },
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
        label: 'Created on ' + created.format('MMMM Do YYYY') + ', ' + created.format('h:mm a'),
        enabled: false
      }
    ]
  }
}

export async function innerMenu(app, tray, data, windows) {
  let hasDeployments = false

  if (Array.isArray(data.deployments) && data.deployments.length > 0) {
    hasDeployments = true
  }

  const config = new Config()

  return [
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        windows.about.show()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      async click() {
        await deploy(tray)
      }
    },
    {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      async click() {
        await share(tray)
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
    {
      type: 'separator'
    },
    {
      label: 'Account',
      submenu: [
        {
          label: config.get('now.user.email') || 'No user defined',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          async click() {
            await logout(app, windows.tutorial)
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
  ]
}

export function outerMenu(app, windows) {
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
      label: process.platform === 'darwin' ? `Quit ${app.getName()}` : 'Quit',
      role: 'quit'
    }
  ]
}
