// Packages
import electron from 'electron'
import React from 'react'
import { func, object } from 'prop-types'
import exists from 'path-exists'
import compare from 'just-compare'
import setRef from 'react-refs'
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc'
import makeUnique from 'make-unique'

// Styles
import {
  wrapStyle,
  listStyle,
  itemStyle,
  helperStyle
} from '../../styles/components/feed/switcher'

// Utilities
import loadData from '../../utils/data/load'
import { API_TEAMS } from '../../utils/data/endpoints'

// Components
import Avatar from './avatar'
import CreateTeam from './create-team'

class Switcher extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      teams: [],
      scope: null,
      online: true,
      initialized: false
    }

    this.remote = electron.remote || false
    this.ipcRenderer = electron.ipcRenderer || false
    this.setReference = setRef.bind(this)

    if (electron.remote) {
      const load = electron.remote.require

      this.binaryUtils = load('./utils/binary')
      this.configUtils = load('./utils/config')
    }

    this.scrollToEnd = this.scrollToEnd.bind(this)
    this.openMenu = this.openMenu.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
    this.onSortStart = this.onSortStart.bind(this)

    // Don't update state when dragging teams
    this.moving = false

    // Ensure that config doesn't get checked when the
    // file is updated from this component
    this.savingConfig = false
  }

  componentWillReceiveProps({ currentUser, activeScope }) {
    if (activeScope) {
      this.changeScope(activeScope, true, true, true)
      return
    }

    if (!currentUser) {
      return
    }

    if (this.state.scope !== null) {
      return
    }

    this.setState({
      scope: currentUser.uid
    })
  }

  componentWillMount() {
    // Support SSR
    if (typeof window === 'undefined') {
      return
    }

    const states = ['online', 'offline']

    for (const state of states) {
      window.addEventListener(state, this.setOnlineState.bind(this))
    }

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    if (!currentWindow) {
      return
    }

    currentWindow.on('show', () => {
      document.addEventListener('keydown', this.keyDown.bind(this))
    })

    currentWindow.on('hide', () => {
      document.removeEventListener('keydown', this.keyDown.bind(this))
    })
  }

  setOnlineState() {
    const online = navigator.onLine
    const newState = { online }

    // Ensure that the animations for the teams
    // fading in works after recovering from offline mode
    if (!online) {
      newState.initialized = false
    }

    this.setState(newState)
  }

  async componentDidMount() {
    const listTimer = () => {
      setTimeout(async () => {
        if (!this.state.online) {
          listTimer()
          return
        }

        try {
          // It's important that this is being `await`ed
          await this.loadTeams()
        } catch (err) {
          // Check if app is even online
          this.setOnlineState()

          // Also do the same for the feed, so that
          // both components reflect the online state
          if (this.props.onlineStateFeed) {
            this.props.onlineStateFeed()
          }

          // Then retry, to ensure that we get the
          // data once it's working again
          listTimer()
          return
        }

        listTimer()
      }, 4000)
    }

    // Only start updating teams once they're loaded!
    // This needs to be async so that we can already
    // start the state timer below for the data that's already cached
    if (!this.state.online) {
      listTimer()
      return
    }

    this.loadTeams().then(listTimer).catch(listTimer)

    // Check the config for `currentTeam`
    await this.checkCurrentTeam()

    // Update the scope if the config changes
    this.listenToConfig()
  }

  listenToConfig() {
    if (!this.ipcRenderer) {
      return
    }

    this.ipcRenderer.on('config-changed', (event, config) => {
      if (this.state.teams.length === 0) {
        return
      }

      if (this.savingConfig) {
        this.savingConfig = false
        return
      }

      this.checkCurrentTeam(config)
    })
  }

  resetScope() {
    const currentUser = this.props.currentUser

    if (!currentUser) {
      return
    }

    this.changeScope({
      id: currentUser.uid
    })
  }

  async checkCurrentTeam(config) {
    if (!this.remote) {
      return
    }

    if (!config) {
      const { getConfig } = this.remote.require('./utils/config')
      config = await getConfig()
    }

    if (!config.currentTeam) {
      this.resetScope()
      return
    }

    this.changeScope(config.currentTeam, true)
  }

  handleSavedOrder(newData, order) {
    if (!order) {
      return
    }

    const ordered = JSON.parse(JSON.stringify(order))

    for (const position of ordered) {
      const index = ordered.indexOf(position)

      ordered[index] = newData.find(item => {
        const name = item.slug || item.name
        return name === position
      })
    }

    if (!compare(newData, ordered)) {
      return
    }

    const { saveConfig } = this.configUtils

    // Remove property `teamOrder` from config
    saveConfig({
      desktop: { teamOrder: null }
    })
  }

  async getTeamOrder() {
    const { getConfig } = this.configUtils
    let config

    try {
      config = await getConfig()
    } catch (err) {}

    if (!config || !config.desktop || !config.desktop.teamOrder) {
      return false
    }

    const order = config.desktop.teamOrder

    if (!Array.isArray(order) || order.length === 0) {
      return false
    }

    return order
  }

  async applyTeamOrder(list, order) {
    const newList = []

    if (!order) {
      return list
    }

    for (const position of order) {
      const index = order.indexOf(position)

      newList[index] = list.find(item => {
        const name = item.slug || item.name
        return name === position
      })
    }

    // See if the saved order is even necessary
    this.handleSavedOrder(list, order)

    // Apply the new data at the end, but keep order
    return this.merge(newList, list)
  }

  merge(first, second) {
    const merged = first.concat(second)
    return makeUnique(merged, (a, b) => a.id === b.id)
  }

  async haveUpdated(data) {
    const newData = JSON.parse(JSON.stringify(data))
    let currentData = JSON.parse(JSON.stringify(this.state.teams))

    if (currentData.length > 0) {
      // Remove teams that the user has left
      currentData = currentData.filter(team => {
        return Boolean(newData.find(item => item.id === team.id))
      })
    }

    const ordered = this.merge(currentData, newData)
    const copy = JSON.parse(JSON.stringify(ordered))
    const order = await this.getTeamOrder()

    if (compare(ordered, currentData)) {
      // See if the saved order is even necessary
      this.handleSavedOrder(newData, order)
      return false
    }

    // Then order the teams as saved in the config
    return this.applyTeamOrder(copy, order)
  }

  orderByAlphabet(list) {
    return list.sort((a, b) => {
      if (!a.name || !b.name) {
        return 0
      }

      if (a.name < b.name) {
        return -1
      } else if (a.name > b.name) {
        return 1
      }

      return 0
    })
  }

  async loadTeams() {
    if (!this.remote) {
      return
    }

    const data = await loadData(API_TEAMS)

    if (!data || !data.teams || !this.props.currentUser) {
      return
    }

    const teams = this.orderByAlphabet(data.teams)
    const user = this.props.currentUser

    teams.unshift({
      id: user.uid,
      name: user.username
    })

    const updated = await this.haveUpdated(teams)

    if (updated) {
      this.setState({ teams: updated })
    }

    if (this.props.setTeams) {
      // When passing `null`, the feed will only
      // update the events, not the teams
      await this.props.setTeams(updated || null)
    }
  }

  keyDown(event) {
    const activeItem = document.activeElement

    if (activeItem && activeItem.tagName === 'INPUT') {
      return
    }

    const code = event.code
    const number = code.includes('Digit') ? code.split('Digit')[1] : false

    if (number && number <= 9 && this.state.teams.length > 1) {
      if (this.state.teams[number - 1]) {
        event.preventDefault()

        const relatedTeam = this.state.teams[number - 1]
        this.changeScope(relatedTeam)
      }
    }
  }

  componentDidUpdate() {
    if (this.state.initialized) {
      return
    }

    const teamsCount = this.state.teams.length

    if (teamsCount === 0) {
      return
    }

    const when = 100 + 100 * teamsCount + 600

    setTimeout(() => {
      // Ensure that the animations for the teams
      // fading in works after recovering from offline mode
      if (!this.state.online) {
        return
      }

      this.setState({
        initialized: true
      })
    }, when)
  }

  async updateConfig(team, updateMessage) {
    if (!this.remote) {
      return
    }

    const { saveConfig } = this.remote.require('./utils/config')
    const currentUser = this.props.currentUser

    if (!currentUser) {
      return
    }

    const info = {
      currentTeam: null
    }

    // Only add fresh data to config if new scope is team, not user
    // Otherwise just clear it
    if (currentUser.uid !== team.id) {
      // Only save the data we need, not the entire object
      info.currentTeam = {
        id: team.id,
        slug: team.slug,
        name: team.name
      }
    }

    // Ensure that config doesn't get checked when the
    // file is updated from this component
    this.savingConfig = true

    // And then update the config file
    await saveConfig(info)

    // Show a notification that the context was updated
    // in the title bar
    if (updateMessage && this.props.titleRef) {
      const { getFile } = this.binaryUtils

      // Only show the notification if the CLI is installed
      if (!await exists(getFile())) {
        return
      }

      this.props.titleRef.scopeUpdated()
    }
  }

  changeScope(team, saveToConfig, byHand, noFeed) {
    // If the clicked item in the team switcher is
    // already the active one, don't do anything
    if (this.state.scope === team.id) {
      return
    }

    if (!noFeed && this.props.setFeedScope) {
      // Load different messages into the feed
      this.props.setFeedScope(team.id)
    }

    // Make the team/user icon look active by
    // syncing the scope with the feed
    this.setState({ scope: team.id })

    // Save the new `currentTeam` to the config
    if (saveToConfig) {
      this.updateConfig(team, byHand)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.moving || this.state === nextState) {
      return false
    }

    return true
  }

  openMenu() {
    // The menu toggler element has children
    // we have the ability to prevent the event from
    // bubbling up from those, but we need to
    // use `this.menu` to make sure the menu always gets
    // bounds to the parent
    const { bottom, left, height, width } = this.menu.getBoundingClientRect()
    const sender = electron.ipcRenderer || false

    if (!sender) {
      return
    }

    sender.send('open-menu', {
      x: left,
      y: bottom,
      height,
      width
    })
  }

  saveTeamOrder(teams) {
    const teamOrder = []

    for (const team of teams) {
      teamOrder.push(team.slug || team.name)
    }

    const { saveConfig } = this.configUtils

    saveConfig({
      desktop: { teamOrder }
    })
  }

  onSortEnd({ oldIndex, newIndex }) {
    document.body.classList.toggle('is-moving')

    // Allow the state to update again
    this.moving = false

    // Don't update if it was dropped at the same position
    if (oldIndex === newIndex) {
      return
    }

    const teams = arrayMove(this.state.teams, oldIndex, newIndex)
    this.saveTeamOrder(teams)

    // Ensure that we're not dealing with the same
    // objects or array ever again
    this.setState({
      teams: JSON.parse(JSON.stringify(teams))
    })
  }

  onSortStart() {
    document.body.classList.toggle('is-moving')

    // Prevent the state from being updated
    this.moving = true
  }

  scrollToEnd(event) {
    event.preventDefault()

    if (!this.list) {
      return
    }

    const list = this.list
    list.scrollLeft = list.offsetWidth
  }

  renderItem() {
    return SortableElement(({ team }) => {
      const isActive = this.state.scope === team.id ? 'active' : ''
      const isUser = !team.id.includes('team')
      const index = this.state.teams.indexOf(team)
      const shouldScale = !this.state.initialized

      const clicked = event => {
        event.preventDefault()
        this.changeScope(team, true, true)
      }

      return (
        <li onClick={clicked} className={isActive} key={team.id}>
          <Avatar
            team={team}
            isUser={isUser}
            scale={shouldScale}
            delay={index}
          />

          <style jsx>{itemStyle}</style>
        </li>
      )
    })
  }

  renderTeams() {
    const Item = this.renderItem()

    return this.state.teams.map((team, index) =>
      <Item key={team.id} index={index} team={team} />
    )
  }

  renderList() {
    const teams = this.renderTeams()

    return SortableContainer(() =>
      <ul>
        {teams}
        <style jsx>{listStyle}</style>
      </ul>
    )
  }

  render() {
    const List = this.renderList()
    const delay = this.state.teams.length

    return (
      <aside>
        {this.state.online
          ? <div className="list-container" ref={this.setReference} name="list">
              <div className="list-scroll">
                <List
                  axis="x"
                  lockAxis="x"
                  pressDelay={1000}
                  onSortEnd={this.onSortEnd}
                  onSortStart={this.onSortStart}
                  helperClass="switcher-helper"
                  lockToContainerEdges={true}
                  lockOffset="0%"
                />
                <CreateTeam delay={delay} />
              </div>

              <span className="shadow" onClick={this.scrollToEnd} />
            </div>
          : <p className="offline">{"You're offline!"}</p>}

        <a
          className="toggle-menu"
          onClick={this.openMenu}
          onContextMenu={this.openMenu}
          ref={this.setReference}
          name="menu"
        >
          <i />
          <i />
          <i />
        </a>

        <style jsx>{wrapStyle}</style>
        <style jsx global>{helperStyle}</style>
      </aside>
    )
  }
}

Switcher.propTypes = {
  setFeedScope: func,
  currentUser: object,
  setTeams: func,
  titleRef: object,
  activeScope: object
}

export default Switcher
