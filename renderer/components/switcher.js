// Packages
import electron from 'electron'
import React from 'react'
import { func } from 'prop-types'

// Utilities
import { getCache, getConfig } from '../utils/data'

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
    this.loadTeams()
  }

  async loadUser() {
    const config = await getConfig()
    const user = config.user

    return {
      slug: user.username
    }
  }

  async loadTeams() {
    const teams = getCache('teams')

    if (!teams) {
      return
    }

    const user = await this.loadUser()
    teams.unshift(user)

    this.setState({ teams })
  }

  changeScope(next) {
    if (!this.props.setScope) {
      return
    }

    // Load different messages into the feed
    this.props.setScope(next)
  }

  renderTeams() {
    if (!this.state) {
      return
    }

    const teams = this.state.teams

    return teams.map((team, index) => {
      // The first one in the array is always the current user
      const imageProp = index === 0 ? 'u' : 'teamId'

      // Prepeare the avatar URL
      const image = `https://zeit.co/api/www/avatar/?${imageProp}=${team.slug}&s=80`

      return (
        <li
          onClick={() => {
            this.changeScope(team.slug)
          }}
        >
          <img src={image} title={team.name || team.slug} />

          <style jsx>
            {`
            li {
              width: 30px;
              height: inherit;
              overflow: hidden;
              border-radius: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 10px;
              cursor: pointer;
            }

            li img {
              width: 100%;
              height: 100%;
            }
          `}
          </style>
        </li>
      )
    })
  }

  render() {
    return (
      <aside>
        <ul>
          {this.renderTeams()}
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

Switcher.propTypes = {
  setScope: func
}

export default Switcher
