// Packages
import electron from 'electron'
import React from 'react'

const openMenu = event => {
  const { bottom, left } = event.target.getBoundingClientRect()
  const sender = electron.ipcRenderer || electron.ipcMain

  sender.send('open-menu', { x: left, y: bottom })
}

const Switcher = () => (
  <aside>
    <nav />

    <a className="toggle-menu" onClick={openMenu}>
      <span>
        <i />
        <i />
        <i />
      </span>
    </a>

    <style jsx>
      {`
      aside {
        height: 50px;
        bottom: 0;
        left: 0;
        right: 0;
        position: fixed;
        border-top: 1px solid #D6D6D6;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        background: #fff;
        user-select: none;
        cursor: default;
      }

      aside .toggle-menu {
        display: block;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      aside .toggle-menu i {
        width: 20px;
        height: 1px;
        background: #5d5d5d;
        display: block;
        opacity: .6;
      }

      aside .toggle-menu:hover i {
        opacity: 1;
      }

      aside span i:nth-child(2) {
        margin: 3px 0;
      }
    `}
    </style>
  </aside>
)

export default Switcher
