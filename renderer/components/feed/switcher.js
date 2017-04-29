// Packages
import electron from 'electron'
import React from 'react'
import { func, object } from 'prop-types'

// Utilities
import remote from '../../utils/electron'
import loadData from '../../utils/data/load'
import { API_TEAMS } from '../../utils/data/endpoints'

class Switcher extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      teams: [],
      scope: null
    }
  }

  componentWillReceiveProps({ currentUser }) {
    if (!currentUser) {
      return
    }

    if (this.state.scope !== null) {
      return
    }

    this.setState({
      scope: currentUser.username
    })
  }

  async componentDidMount() {
    await this.loadTeams()

    const startTimer = () =>
      setTimeout(async () => {
        await this.loadTeams()
        startTimer()
      }, 4000)

    startTimer()
  }

  resetScope() {
    const currentUser = this.props.currentUser

    if (!currentUser) {
      return
    }

    this.changeScope({
      id: currentUser.username
    })
  }

  async checkCurrentTeam() {
    const { get, save } = remote.require('./utils/config')
    const config = await get()

    if (!config) {
      return
    }

    if (!config.currentTeam) {
      this.resetScope()
      return
    }

    if (this.state.teams.length === 0) {
      return
    }

    const currentTeam = config.currentTeam

    const isCached = this.state.teams.find(team => {
      return team.id === currentTeam.id
    })

    if (!isCached) {
      // If the current team isn't cached, remove it from config
      await save({
        currentTeam: {}
      })

      this.resetScope()
      return
    }

    this.changeScope(isCached, true)
  }

  async loadTeams() {
    const data = await loadData(API_TEAMS)

    if (!data || !data.teams || !this.props.currentUser) {
      return
    }

    const teams = data.teams

    teams.unshift({
      id: this.props.currentUser.username
    })

    // Only update state if the list of teams has changed
    if (this.state.teams !== teams) {
      this.setState({ teams })

      if (!this.props.setTeams) {
        return
      }

      // Save teams
      await this.props.setTeams(teams)
    }

    // See if config has `currentTeam` saved and
    // update the scope if so
    await this.checkCurrentTeam()
  }

  async updateConfig(team) {
    const { save: saveConfig } = remote.require('./utils/config')
    const currentUser = this.props.currentUser

    if (!currentUser) {
      return
    }

    const info = {
      currentTeam: {}
    }

    // Only add fresh data to config if new scope is team, not user
    // Otherwise just clear it
    if (currentUser.username !== team.id) {
      // Only save the data we need, not the entire object
      info.currentTeam = {
        id: team.id,
        slug: team.slug,
        name: team.name
      }
    }

    await saveConfig(info)
  }

  changeScope(team, saveToConfig) {
    // If the clicked item in the team switcher is
    // already the active one, don't do anything
    if (this.state.scope === team.id) {
      return
    }

    if (!this.props.setFeedScope) {
      return
    }

    // Load different messages into the feed
    this.props.setFeedScope(team.id)

    // Make the team/user icon look active by
    // syncing the scope with the feed
    this.setState({ scope: team.id })

    // Save the new `currentTeam` to the config
    if (saveToConfig) {
      this.updateConfig(team)
    }
  }

  openMenu() {
    // The menu toggler element has children
    // we have the ability to prevent the event from
    // bubbling up from those, but we need to
    // use `this.menu` to make sure the menu always gets
    // bounds to the parent
    const { bottom, left } = this.menu.getBoundingClientRect()
    const sender = electron.ipcRenderer || electron.ipcMain

    sender.send('open-menu', { x: left, y: bottom })
  }

  renderTeams() {
    if (!this.state) {
      return
    }

    const teams = this.state.teams

    return teams.map((team, index) => {
      // The first one in the array is always the current user
      const imageProp = index === 0 ? 'u' : 'teamId'
      const image = `https://zeit.co/api/www/avatar/?${imageProp}=${team.id}&s=80`
      const isActive = this.state.scope === team.id ? 'active' : ''

      const clicked = () => {
        this.changeScope(team, true)
      }

      return (
        <li onClick={clicked} className={isActive} key={team.id}>
          <img src={image} title={team.name || team.id} draggable="false" />

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
    const menuRef = element => {
      this.menu = element
    }

    return (
      <aside>
        <ul>
          {this.renderTeams()}

          <li onClick={this.createTeam} title="Create a Team">
            <i />
            <i />
          </li>
        </ul>

        <a
          className="toggle-menu"
          onClick={this.openMenu.bind(this)}
          ref={menuRef}
        >
          <i />
          <i />
          <i />
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
            align-items: center;
          }

          aside .toggle-menu {
            display: block;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          aside .toggle-menu i {
            width: 20px;
            height: 1px;
            background: #4e4e4e;
            display: block;
            opacity: .5;
            transition: opacity .2s ease;
          }

          aside .toggle-menu i:nth-child(2) {
            margin: 3px 0;
          }

          aside .toggle-menu:hover i {
            opacity: 1;
          }
        `}
        </style>
      </aside>
    )
  }
}

Switcher.propTypes = {
  setFeedScope: func,
  currentUser: object,
  setTeams: func
}

export default Switcher
