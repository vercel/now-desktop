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
      teams: [],
      scope: null
    }
  }

  componentDidMount() {
    this.setInitialScope()
    this.loadTeams()
  }

  async setInitialScope() {
    const user = await this.loadUser()

    this.setState({
      scope: user.username
    })
  }

  async loadUser() {
    const config = await getConfig()
    return config.user
  }

  async loadTeams() {
    const teams = getCache('teams')

    if (!teams) {
      return
    }

    const user = await this.loadUser()

    teams.unshift({
      slug: user.username
    })

    this.setState({ teams })
  }

  changeScope(scope) {
    // If the clicked item in the team switcher is
    // already the active one, don't do anything
    if (this.state.scope === scope) {
      return
    }

    if (!this.props.setFeedScope) {
      return
    }

    // Load different messages into the feed
    this.props.setFeedScope(scope)

    // Make the team/user icon look active by
    // syncing the scope with the feed
    this.setState({ scope })
  }

  renderTeams() {
    if (!this.state) {
      return
    }

    const teams = this.state.teams

    return teams.map((team, index) => {
      // The first one in the array is always the current user
      const imageProp = index === 0 ? 'u' : 'teamId'
      const image = `https://zeit.co/api/www/avatar/?${imageProp}=${team.slug}&s=80`
      const isActive = this.state.scope === team.slug ? 'active' : ''

      const clicked = event => {
        this.changeScope(team.slug, event.target)
      }

      return (
        <li onClick={clicked} className={isActive} key={team.slug}>
          <img src={image} title={team.name || team.slug} />

          <style jsx>
            {`
            /*
              Do not user hidden overflow here, otherwise
              the images will be cut off at the bottom
              that's a renderer-bug in chromium
            */

            li {
              width: 30px;
              height: 30px;
              border-radius: 100%;
              margin-right: 10px;
              cursor: pointer;
              opacity: .3;
              transition: opacity .3s ease;
            }

            li.active {
              opacity: 1;
              cursor: default;
            }

            li img {
              width: inherit;
              height: inherit;
              border-radius: inherit;
            }
          `}
          </style>
        </li>
      )
    })
  }

  createTeam() {
    electron.shell.openExternal('https://zeit.co/teams/create')
  }

  render() {
    return (
      <aside>
        <ul>
          {this.renderTeams()}

          <li onClick={this.createTeam} title="Create a Team">
            <i />
            <i />
          </li>
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
            height: inherit;
            width: 30px;
            cursor: pointer;
            border-radius: 100%;
            box-sizing: border-box;
            border: 1px solid #b1b1b1;
            position: relative;
            transition: all .2s ease;
          }

          li:hover {
            border-color: #4e4e4e;
          }

          li i {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          li i:before {
            content: '';
            display: block;
            background: #b1b1b1;
            height: 12px;
            width: 1px;
            transition: all .2s ease;
          }

          li:hover i:before {
            height: 16px;
            background: #4e4e4e;
          }

          li i:last-child {
            transform: rotate(90deg);
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
  setFeedScope: func
}

export default Switcher
