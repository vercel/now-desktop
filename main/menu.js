const {
  Menu: { buildFromTemplate },
  shell,
  clipboard
} = require('electron');
const isDev = require('electron-is-dev');
const logout = require('./logout');
const { removeConfig, getConfig, saveConfig } = require('./config');

exports.getMainMenu = async (app, tray, window, inRenderer) => {
  const { openAtLogin } = app.getLoginItemSettings();
  let config = {};

  try {
    config = await getConfig();
  } catch (error) {}

  const isCanary = config.updateChannel === 'canary';

  // We have to explicitly add a "Main" item on linux, otherwise
  // there would be no way to toggle the main window
  const prependItems =
    process.platform === 'linux'
      ? [
          {
            label: 'Main',
            click() {
              console.log('test');
            }
          }
        ]
      : [];

  return buildFromTemplate(
    prependItems.concat(
      [
        {
          label: process.platform === 'darwin' ? `About ${app.name}` : 'About',
          click() {
            window.webContents.send('open-about-screen');
          }
        },
        {
          label: 'Give Us Feedback',
          click() {
            shell.openExternal('https://zeit.co/feedback/desktop');
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
              label: 'Change Username',
              click() {
                shell.openExternal('https://zeit.co/account');
              }
            },
            {
              label: 'Billing',
              click() {
                shell.openExternal('https://zeit.co/account/billing');
              }
            },
            {
              label: 'Plan',
              click() {
                shell.openExternal('https://zeit.co/account/plan');
              }
            },
            {
              label: 'API Tokens',
              click() {
                shell.openExternal('https://zeit.co/account/tokens');
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Log Out',
              click() {
                logout().then(() => {
                  removeConfig().then(() => {
                    window.webContents.send('logged-out');
                  });
                });
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
            shell.openExternal('https://zeit.chat');
          }
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal('https://zeit.co/docs');
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
                });
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
                saveConfig(
                  { updateChannel: isCanary ? 'stable' : 'canary' },
                  'config'
                );
              }
            },
            {
              label: 'Learn How to Update CLI',
              click() {
                shell.openExternal('https://zeit.co/guides/updating-now-cli');
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
                window.webContents.openDevTools();
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
  );
};

exports.getEventMenu = (url, id, dashboardUrl) => {
  const menuContent = [];

  if (url) {
    menuContent.push({
      label: 'Copy URL',
      click() {
        const link = `https://${url}`;
        clipboard.writeText(link);
      }
    });
  }

  if (id) {
    menuContent.push({
      label: 'Copy ID',
      click() {
        clipboard.writeText(id);
      }
    });
  }

  if (dashboardUrl) {
    if (menuContent.length > 0) {
      menuContent.push({
        type: 'separator'
      });
    }

    menuContent.push({
      label: 'Open in Dashboard',
      click() {
        shell.openExternal(dashboardUrl);
      }
    });
  }

  if (menuContent.length === 0) {
    return null;
  }

  return buildFromTemplate(menuContent);
};
