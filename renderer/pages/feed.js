// Native
import queryString from 'querystring'
import os from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import moment from 'moment'
import dotProp from 'dot-prop'
import makeUnique from 'make-unique'
import compare from 'just-compare'
import setRef from 'react-refs'

// Components
import Title from '../components/title'
import Switcher from '../components/feed/switcher'
import DropZone from '../components/feed/dropzone'
import TopArrow from '../components/feed/top-arrow'
import EventMessage from '../components/feed/event'
import NoEvents from '../components/feed/none'
import Loading from '../components/feed/loading'

// Styles
import {
  feedStyles,
  headingStyles,
  loaderStyles,
  pageStyles
} from '../styles/pages/feed'

class Feed extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dropZone: false,
      events: {},
      scope: null,
      currentUser: null,
      teams: [],
      eventFilter: null,
      online: true
    }

    this.remote = electron.remote || false
    this.ipcRenderer = electron.ipcRenderer || false
    this.isWindows = os.platform() === 'win32'
    this.setReference = setRef.bind(this)

    // Load the necessary helpers before usign them
    if (electron.remote) {
      const load = electron.remote.require

      this.loadData = load('./utils/data/load')
      this.endpoints = load('./utils/data/endpoints')
    }

    const toBind = [
      'showDropZone',
      'setFilter',
      'hideDropZone',
      'scrolled',
      'setTeams',
      'setScope',
      'setOnlineState',
      'setReference'
    ]

    for (const bindable of toBind) {
      this[bindable] = this[bindable].bind(this)
    }

    // Ensure that we're not loading events again
    this.loading = new Set()
  }

  async updateEvents() {
    const teams = this.state.teams

    if (!teams || Object.keys(teams).length === 0) {
      return
    }

    let focusedIndex

    // Load the focused team first
    if (this.state.scope) {
      const focusedTeam = teams.find(team => {
        return team.id === this.state.scope
      })

      focusedIndex = teams.indexOf(focusedTeam)
      this.loadEvents(focusedTeam.id)
    }

    // Update the feed of events for each team
    for (const team of teams) {
      const index = teams.indexOf(team)

      // Don't load the focused team, because we updated
      // that one already above. We need to test for `undefined` here
      // because checking if falsy is not ok since the value might
      // be `0` (beginning of `teams` array)
      if (focusedIndex !== undefined && index === focusedIndex) {
        continue
      }

      this.loadEvents(team.id)
    }
  }

  async loadEvents(scope, until) {
    if (!this.remote || this.loading.has(scope)) {
      return
    }

    this.loading.add(scope)

    const teams = this.state.teams
    const relatedCache = teams.find(item => item.id === scope)
    const lastUpdate = relatedCache.lastUpdate
    const relatedCacheIndex = teams.indexOf(relatedCache)

    const query = {
      limit: 15
    }

    // Check if it's a user (always the first team)
    if (relatedCacheIndex > 0) {
      query.teamId = scope
    }

    if (until) {
      query.until = until
    } else if (typeof relatedCache !== 'undefined' && lastUpdate) {
      // Ensure that we only load events that were created
      // after the most recent one, so that we don't get the most
      // recent one included
      const startDate = Date.parse(lastUpdate) + 1
      query.since = new Date(startDate).toISOString()
    }

    const params = queryString.stringify(query)
    const { API_EVENTS } = this.endpoints

    let data

    try {
      data = await this.loadData(`${API_EVENTS}?${params}`)
    } catch (err) {}

    if (!data || !data.events) {
      this.loading.delete(scope)
      return
    }

    const hasEvents = data.events.length > 0
    const events = this.state.events
    const scopedEvents = events[scope]

    if (!hasEvents && events[scope]) {
      this.loading.delete(scope)
      return
    }

    if (hasEvents) {
      teams[relatedCacheIndex].lastUpdate = data.events[0].created
    }

    if (hasEvents && scopedEvents) {
      let merged

      // When using infinite scrolling, we need to
      // add the events to the end, otherwise before
      if (until) {
        merged = scopedEvents.concat(data.events)
      } else {
        merged = data.events.concat(scopedEvents)
      }

      const unique = makeUnique(merged, (a, b) => a.id === b.id)

      // Ensure that never more than 100 events are cached
      // But only if infinite scrolling isn't being used
      events[scope] = until ? unique : unique.slice(0, 100)
    } else {
      events[scope] = data.events
    }

    this.setState({ events, teams }, () => {
      // Now the infinite scroller can load data again
      this.loading.delete(scope)
    })
  }

  hideWindow(event) {
    if (event.keyCode !== 27) {
      return
    }

    event.preventDefault()
    const activeItem = document.activeElement

    if (activeItem && activeItem.tagName === 'INPUT') {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    currentWindow.hide()
  }

  listenToUserChange() {
    if (!this.ipcRenderer) {
      return
    }

    // Update the `currentUser` state to reflect
    // switching the account using `now login`
    this.ipcRenderer.on('config-changed', (event, config) => {
      if (compare(this.state.currentUser, config.user)) {
        return
      }

      // Clear up the events to load new ones
      const events = this.state.events

      events[this.state.scope] = []
      events[config.user.uid] = []

      this.setState({ currentUser: config.user, events })
    })
  }

  async componentWillMount() {
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

    const { getConfig } = this.remote.require('./utils/config')
    const config = await getConfig()

    this.setState({
      scope: config.user.uid,
      currentUser: config.user
    })

    // Switch the `currentUser` property if config changes
    this.listenToUserChange()

    const currentWindow = this.remote.getCurrentWindow()

    if (!currentWindow) {
      return
    }

    currentWindow.on('show', () => {
      document.addEventListener('keydown', this.hideWindow.bind(this))
    })

    currentWindow.on('hide', () => {
      if (this.scrollingSection) {
        this.scrollingSection.scrollTop = 0
      }

      document.removeEventListener('keydown', this.hideWindow.bind(this))
    })
  }

  setOnlineState() {
    this.setState({
      online: navigator.onLine
    })
  }

  showDropZone() {
    this.setState({
      dropZone: true
    })
  }

  hideDropZone() {
    this.setState({
      dropZone: false
    })
  }

  setScope(scope) {
    if (this.scrollingSection) {
      this.scrollingSection.scrollTop = 0
    }

    this.setState({ scope })

    // Hide search field when switching team scope
    if (this.searchField) {
      this.searchField.hide(true)
    }
  }

  async setTeams(teams) {
    if (!teams) {
      // If the teams didn't change, only the events
      // should be updated
      await this.updateEvents()
      return
    }

    for (const team of teams) {
      const relatedCache = this.state.teams.find(item => item.id === team.id)
      team.lastUpdate = relatedCache ? relatedCache.lastUpdate : null
    }

    this.setState({ teams })
    await this.updateEvents()
  }

  setFilter(eventFilter) {
    this.setState({ eventFilter })
  }

  filterEvents(list) {
    // If there's no filter enabled, just hand
    // the list of events back unchanged
    if (!this.state.eventFilter) {
      return list
    }

    // Properties to search in
    const searchable = [
      'payload.deploymentId',
      'user.email',
      'user.username',
      'payload.name',
      'payload.url',
      'payload.alias',
      'payload.oldTeam',
      'payload.newTeam',
      'payload.slug',
      'payload.username',
      'payload.plan',
      'payload.domain',
      'payload.cn'
    ]

    // Split search phrase into keywords but make
    // sure to avoid empty ones (in turn, `.includes` is not ok)
    const keywords = this.state.eventFilter.match(/[^ ]+/g)

    const matches = list.filter(item => {
      for (const prop of searchable) {
        const toSearch = dotProp.get(item, prop)

        if (!toSearch) {
          continue
        }

        if (typeof toSearch !== 'string') {
          continue
        }

        if (new RegExp(keywords.join('|')).test(toSearch)) {
          return true
        }
      }

      return false
    })

    return matches
  }

  getEvents(scope) {
    const scopedEvents = this.state.events[scope]

    if (!scopedEvents || scopedEvents.length === 0) {
      return false
    }

    return scopedEvents
  }

  scrolled(event) {
    if (!this.loadingIndicator) {
      return
    }

    const section = event.target
    const offset = section.offsetHeight + this.loadingIndicator.offsetHeight
    const distance = section.scrollHeight - section.scrollTop
    const scope = this.state.scope
    const notLoading = !this.loading.has(scope)

    if (notLoading && distance < offset + 300) {
      const scopedEvents = this.state.events[scope]
      const lastEvent = scopedEvents[scopedEvents.length - 1]

      this.loadEvents(scope, lastEvent.created)
    }
  }

  renderEvents() {
    if (!this.state.online) {
      return <Loading offline />
    }

    const scope = this.state.scope
    const scopedEvents = this.state.events[scope]

    if (!scopedEvents) {
      return <Loading />
    }

    if (scopedEvents.length === 0) {
      return <NoEvents />
    }

    const filteredEvents = this.filterEvents(scopedEvents)

    if (filteredEvents.length === 0) {
      return <NoEvents filtered />
    }

    const months = {}

    for (const message of filteredEvents) {
      const created = moment(message.created)
      const month = created.format('MMMM YYYY')

      if (!months[month]) {
        months[month] = []
      }

      months[month].push(message)
    }

    let scopedTeam = {}

    if (this.state.teams && scope !== this.state.currentUser.uid) {
      scopedTeam = this.state.teams.find(team => {
        return team.id === scope
      })
    }

    const eventList = month =>
      months[month].map(item => {
        return (
          <EventMessage
            content={item}
            key={item.id}
            currentUser={this.state.currentUser}
            team={scopedTeam}
          />
        )
      })

    const monthKeys = Object.keys(months)

    if (monthKeys.length === 0) {
      return <NoEvents />
    }

    // We can't just use `month` as the ID for each heading,
    // because they would glitch around in that case (as
    // the month is the same across scopes)
    return monthKeys.map(month => [
      <h1 key={scope + month}>
        {month}
        <style jsx>{headingStyles}</style>
      </h1>,
      eventList(month)
    ])
  }

  loadingOlder() {
    if (this.state.eventFilter) {
      return
    }

    const scope = this.state.scope
    const scopedEvents = this.state.events[scope]

    if (!scopedEvents || scopedEvents.length < 15) {
      return
    }

    return (
      <aside ref={this.setReference} name="loadingIndicator">
        <img src="/static/loading.gif" />
        <span>Loading Older Events...</span>

        <style jsx>{loaderStyles}</style>
      </aside>
    )
  }

  render() {
    const scope = this.state.scope
    const searchShown = this.getEvents(scope) && true

    const activeScope = this.state.teams.find(team => team.id === scope)

    return (
      <main>
        {!this.isWindows && <TopArrow />}

        <div onDragEnter={this.showDropZone}>
          <Title
            setFilter={this.setFilter}
            setSearchRef={this.setReference}
            searchShown={searchShown}
            ref={this.setReference}
            light
            name="title"
          >
            {activeScope ? activeScope.name : 'Now'}
          </Title>

          {this.state.dropZone && <DropZone hide={this.hideDropZone} />}

          <section
            ref={this.setReference}
            onScroll={this.scrolled}
            name="scrollingSection"
          >
            {this.renderEvents()}
            {this.loadingOlder()}
          </section>

          <Switcher
            setFeedScope={this.setScope}
            setTeams={this.setTeams}
            currentUser={this.state.currentUser}
            titleRef={this.title}
            onlineStateFeed={this.setOnlineState}
          />
        </div>

        <style jsx>{feedStyles}</style>
        <style jsx global>{pageStyles}</style>
      </main>
    )
  }
}

export default Feed
