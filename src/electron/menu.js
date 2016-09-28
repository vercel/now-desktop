// Packages
import {shell, clipboard, dialog} from 'electron'
import moment from 'moment'
import Config from 'electron-config'

// Ours
import {deploy, share, error} from './dialogs'
import logout from './actions/logout'
import {connector, refreshCache} from './api'
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
        click: async () => {
          // Ask the user if it was an accident
          const keepIt = dialog.showMessageBox({
            type: 'question',
            title: 'Removal of ' + info.name,
            message: 'Do you really want to delete this deployment?',
            detail: info.name,
            buttons: [
              'Yes',
              'Hell, no!'
            ]
          })

          // If so, do nothing
          if (keepIt) {
            return
          }

          notify({
            title: `Deleting ${info.name}...`,
            body: 'The deployment is being removed from our servers.'
          })

          // Otherwise, delete the deployment
          const now = connector()

          try {
            await now.deleteDeployment(info.uid)
          } catch (err) {
            console.error(err)
            error('Failed to remove deployment ' + info.name)

            return
          }

          notify({
            title: 'Deleted ' + info.name,
            body: 'The deployment has successfully been deleted.'
          })

          try {
            await refreshCache('deployments')
          } catch (err) {
            return error(err)
          }
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
      click: () => windows.about.show()
    },
    {
      type: 'separator'
    },
    {
      label: 'Deploy...',
      accelerator: 'CmdOrCtrl+D',
      click: async () => await deploy(tray)
    },
    {
      label: 'Share...',
      accelerator: 'CmdOrCtrl+S',
      click: async () => await share(tray)
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
          click: async () => await logout(app, windows.tutorial)
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
      click: () => toggleWindow(null, windows.about)
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
