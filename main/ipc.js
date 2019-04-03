const { ipcMain, shell } = require('electron')
const { getConfig, saveConfig } = require('./config')
const getMenu = require('./menu')

module.exports = (app, tray, window) => {
  ipcMain.on('config-get-request', async event => {
    let config = null

    try {
      config = await getConfig()
    } catch (err) {
      config = err
    }

    event.sender.send('config-get-response', config)
  })

  ipcMain.on('config-save-request', async (event, data, type, firstSave) => {
    let reply = null

    try {
      await saveConfig(data, type, firstSave)
    } catch (err) {
      console.log(err)
      reply = err
    }

    event.sender.send('config-save-response', reply)
  })

  ipcMain.on('url-request', async (event, url) => {
    shell.openExternal(url)
  })

  ipcMain.on('open-menu-request', async (event, bounds) => {
    if (bounds && bounds.x && bounds.y) {
      bounds.x = parseInt(bounds.x.toFixed(), 10) + bounds.width / 2
      bounds.y = parseInt(bounds.y.toFixed(), 10) - bounds.height / 2

      const menu = await getMenu(app, tray, window, true)

      menu.popup({
        x: bounds.x,
        y: bounds.y
      })
    }
  })
}
