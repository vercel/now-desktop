// Packages
import electron from 'electron'
import React from 'react'

// Utilities
import getData from '../utils/cache'

const openMenu = event => {
  const { bottom, left } = event.target.getBoundingClientRect()
  const sender = electron.ipcRenderer || electron.ipcMain

  sender.send('open-menu', { x: left, y: bottom })
}

class Switcher extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      teams: []
    }
  }

  componentDidMount() {
    this.loadUser()
  }

  loadUser() {
    const teams = getData('teams')

    if (!teams) {
      return
    }

    this.setState({
      teams
    })
  }

  render() {
    return (
      <aside>
        <ul>
          <li>
            <img src="https://zeit.co/api/www/avatar/?u=rauchg&s=80" />
          </li>

          {this.state &&
            this.state.teams.map(team => (
              <li>
                <img
                  src={`https://zeit.co/api/www/avatar/?teamId=${team.slug}&s=80`}
                />
              </li>
            ))}
        </ul>

        <a className="toggle-menu" onClick={openMenu}>
          <span>
            <i />
            <i />
            <i />
          </span>
        </a>

        <style jsx>
          {`
          ul {
            margin: 0 0 0 10px;
            list-style: none;
            display: flex;
            flex-direction: row;
            padding: 0;
            height: 30px;
          }

          li {
            width: 30px;
            height: inherit;
            overflow: hidden;
            border-radius: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 10px;
          }

          li img {
            width: 100%;
            height: 100%;
          }

          li span {
            font-size: 12px;
            color: #7F7F7F;
          }

          aside {
            height: 50px;
            bottom: 0;
            left: 0;
            right: 0;
            flex-shrink: 0;
            border-top: 1px solid #D6D6D6;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            background: #fff;
            user-select: none;
            cursor: default;
            align-items: center;
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
            background: #4e4e4e;
            display: block;
            opacity: .5;
            transition: opacity .2s ease;
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
  }
}

export default Switcher