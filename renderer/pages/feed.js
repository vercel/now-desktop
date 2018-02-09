// Native
import queryString from 'querystring'
import os from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import compare from 'just-compare'
import setRef from 'react-refs'
import { renderToStaticMarkup } from 'react-dom/server'
import strip from 'strip'
import parseHTML from 'html-to-react'
import retry from 'async-retry'
import ms from 'ms'
import isDev from 'electron-is-dev'
import makeUnique from 'make-unique'

// Components
import Title from '../components/title'
import Switcher from '../components/feed/switcher'
import DropZone from '../components/feed/dropzone'
import TopArrow from '../components/feed/top-arrow'
import EventMessage from '../components/feed/event'
import NoEvents from '../components/feed/none'
import Loading from '../components/feed/loading'
import messageComponents from '../components/feed/messages'

// Utilities
import loadData from '../utils/data/load'
import { API_EVENTS } from '../utils/data/endpoints'

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
      online: true,
      typeFilter: 'team'
    }

    this.remote = electron.remote || false
    this.ipcRenderer = electron.ipcRenderer || false
    this.isWindows = os.platform() === 'win32'
    this.setReference = setRef.bind(this)

    this.showDropZone = this.showDropZone.bind(this)
    this.setFilter = this.setFilter.bind(this)
    this.hideDropZone = this.hideDropZone.bind(this)
    this.scrolled = this.scrolled.bind(this)
    this.setTeams = this.setTeams.bind(this)
    this.setScope = this.setScope.bind(this)
    this.setOnlineState = this.setOnlineState.bind(this)
    this.setScopeWithSlug = this.setScopeWithSlug.bind(this)
    this.setTypeFilter = this.setTypeFilter.bind(this)

    // Ensure that we're not loading events again
    this.loading = new Set()

    // Generate event types once in the beginning
    this.eventTypes = this.getEventTypes()
  }

  getCurrentGroup() {
    const { typeFilter } = this.state

    if (this.isUser() && typeFilter === 'team') {
      return 'me'
    }

    return typeFilter
  }

  isUser(activeScope) {
    const { currentUser, scope } = this.state

    if (!activeScope) {
      activeScope = this.detectScope('id', scope)
    }

    if (currentUser && activeScope && activeScope.id === currentUser.uid) {
      return true
    }

    return false
  }

  async updateEvents(firstLoad) {
    const { teams, scope } = this.state

    if (!teams || Object.keys(teams).length === 0 || !scope) {
      return
    }

    // Load the focused team first
    const focusedTeam = teams.find(team => {
      return team.id === this.state.scope
    })

    const focusedIndex = teams.indexOf(focusedTeam)

    // It's important that this is being `await`ed
    try {
      await this.cacheEvents(focusedTeam.id)
    } catch (err) {
      console.log(err)
    }

    if (!firstLoad) {
      return
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

      // It's important that this is being `await`ed
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.cacheEvents(team.id)
      } catch (err) {
        console.log(err)
      }
    }
  }

  getEventTypes() {
    const auto = new Set([
      'scale-auto',
      'deployment-freeze',
      'deployment-unfreeze'
    ])

    const all = new Set(messageComponents.keys())
    const manual = [...all].filter(t => !auto.has(t))

    return {
      auto,
      manual: new Set(manual)
    }
  }

  async loadEvents(customParams) {
    const defaults = { limit: 30 }
    const query = Object.assign(defaults, customParams)

    if (query.types) {
      query.types = Array.from(query.types).join(',')
    }

    const params = queryString.stringify(query)
    const { events } = await loadData(`${API_EVENTS}?${params}`)

    return events
  }

  getGroups(isTeam, until) {
    // Can't be a `Set` because we need to pick per index
    // down in the code later
    let groups = ['me', 'team', 'system']

    if (!isTeam) {
      groups.splice(1, 1)
    }

    // When scrolling down, only update the
    // current group of events
    if (until) {
      const currentGroup = this.getCurrentGroup()
      groups = [currentGroup]
    }

    return groups
  }

  async cacheEvents(scope, until) {
    const types = this.eventTypes
    const { teams, currentUser } = this.state

    if (until) {
      this.loading.add(scope)
    }

    const relatedCache = teams.find(item => item.id === scope)
    const lastUpdate = relatedCache.lastUpdate
    const isTeam = Boolean(relatedCache.slug)

    const groups = this.getGroups(isTeam)
    const loaders = new Set()

    for (const group of groups) {
      const isSystem = group === 'system'
      const type = isSystem ? 'auto' : 'manual'

      const query = {
        types: types[type]
      }

      if (until) {
        query.until = until
      } else if (lastUpdate && lastUpdate[group]) {
        // Ensure that we only load events that were created
        // after the most recent one, so that we don't get the most
        // recent one included
        const startDate = Date.parse(lastUpdate[group]) + 1
        query.since = new Date(startDate).toISOString()
      }

      if (isTeam) {
        query.teamId = scope

        if (group === 'me') {
          query.userId = currentUser.uid
        }
      }

      loaders.add(this.loadEvents(query))
    }

    let results

    try {
      results = await Promise.all(loaders)
    } catch (err) {
      if (until) {
        this.loading.delete(scope)
      }

      return
    }

    const newEvents = {}
    const events = Object.assign({}, this.state.events)
    const relatedCacheIndex = teams.indexOf(relatedCache)

    if (!teams[relatedCacheIndex].allCached) {
      teams[relatedCacheIndex].allCached = {}
    }

    for (const result of results) {
      const index = results.indexOf(result)
      const group = groups[index]
      const hasEvents = result.length > 0

      newEvents[group] = result

      if (!hasEvents && events[scope] && events[scope][group]) {
        if (until) {
          teams[relatedCacheIndex].allCached[group] = true

          this.setState({ teams }, () => {
            this.loading.delete(scope)
          })
        }

        return
      }

      let newLastUpdate

      if (hasEvents) {
        newLastUpdate = result[0].created
      } else {
        newLastUpdate = new Date().toISOString()
      }

      if (!teams[relatedCacheIndex].lastUpdate) {
        teams[relatedCacheIndex].lastUpdate = {}
      }

      teams[relatedCacheIndex].lastUpdate[group] = newLastUpdate

      const scopedEvents = events[scope]
      let groupedEvents

      if (scopedEvents) {
        groupedEvents = scopedEvents[group]
      } else {
        events[scope] = {}
      }

      if (hasEvents && scopedEvents && groupedEvents) {
        let merged

        // When using infinite scrolling, we need to
        // add the events to the end, otherwise before
        if (until) {
          merged = groupedEvents.concat(result)
        } else {
          merged = result.concat(groupedEvents)
        }

        const unique = makeUnique(merged, (a, b) => a.id === b.id)

        // Ensure that never more than 50 events are cached
        // But only if infinite scrolling isn't being used
        events[scope][group] = until ? unique : unique.slice(0, 50)
      } else {
        events[scope][group] = result
      }
    }

    this.setState(
      {
        events,
        teams
      },
      () => {
        this.loading.delete(scope)
      }
    )
  }

  onKeyDown(event) {
    const currentWindow = this.remote.getCurrentWindow()
    const { keyCode, metaKey, altKey } = event

    // Allow developers to inspect the app in production
    if (keyCode === 73 && metaKey && altKey && !isDev) {
      currentWindow.webContents.openDevTools()
    }

    if (event.keyCode !== 27) {
      return
    }

    event.preventDefault()
    const activeItem = document.activeElement

    if (activeItem && activeItem.tagName === 'INPUT') {
      return
    }

    currentWindow.hide()
  }

  listenToUserChange() {
    if (!this.ipcRenderer) {
      return
    }

    // Update the `currentUser` state to reflect
    // switching the account using `now login`
    this.ipcRenderer.on('config-changed', (event, config) => {
      const { user } = config

      if (compare(this.state.currentUser, user)) {
        return
      }

      this.setState({
        scope: user.uid,
        currentUser: user,
        events: {},
        teams: [],
        eventFilter: null,
        typeFilter: 'team'
      })
    })
  }

  clearScroll() {
    if (!this.scrollingSection) {
      return
    }

    this.scrollingSection.scrollTop = 0
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
    let scrollTimer

    currentWindow.on('show', () => {
      // Ensure that scrolling position only gets
      // resetted if the window was closed for 5 seconds
      clearTimeout(scrollTimer)

      // When the app is hidden and the device in standby
      // mode, it might not be able to render the updates, so we
      // need to ensure that it's updated
      this.forceUpdate()

      // And then allow hiding the windows using the keyboard
      document.addEventListener('keydown', this.onKeyDown.bind(this))
    })

    currentWindow.on('hide', () => {
      // Clear scrolling position if window closed for 5 seconds
      scrollTimer = setTimeout(this.clearScroll.bind(this), ms('5s'))

      // Remove key press listeners
      document.removeEventListener('keydown', this.onKeyDown.bind(this))
    })
  }

  setOnlineState() {
    this.setState({ online: navigator.onLine })
  }

  showDropZone() {
    this.setState({ dropZone: true })
  }

  hideDropZone() {
    this.setState({ dropZone: false })
  }

  setTypeFilter(type) {
    this.setState({ typeFilter: type })
  }

  setScope(scope) {
    this.clearScroll()

    // Update the scope
    this.setState({ scope }, () => {
      if (this.state.teams.length === 0) {
        return
      }

      // And then pull events for it
      this.cacheEvents(scope)
    })

    // Hide search field when switching team scope
    if (this.searchField) {
      this.searchField.hide(true)
    }
  }

  setScopeWithSlug(slug) {
    const detected = this.detectScope('slug', slug)

    if (detected) {
      this.setScope(detected.id)
    }
  }

  detectScope(property, value) {
    return this.state.teams.find(team => team[property] === value)
  }

  async setTeams(teams, firstLoad) {
    if (!teams) {
      // If the teams didn't change, only the events
      // should be updated.
      // It's important that this is being `await`ed
      await this.updateEvents(firstLoad)
      return
    }

    for (const team of teams) {
      const relatedCache = this.state.teams.find(item => item.id === team.id)
      team.lastUpdate = relatedCache ? relatedCache.lastUpdate : null
    }

    return new Promise(resolve =>
      this.setState({ teams }, async () => {
        await retry(() => this.updateEvents(firstLoad), {
          retries: 5,
          factor: 2,
          maxTimeout: 5000
        })

        resolve()
      })
    )
  }

  setFilter(eventFilter) {
    this.setState({ eventFilter })
  }

  filterEvents(list, scopedTeam, group) {
    const { eventFilter } = this.state
    const filtering = Boolean(eventFilter)
    const HTML = parseHTML.Parser

    let keywords = null

    if (filtering) {
      // Split search phrase into keywords but make
      // sure to avoid empty ones (in turn, `.includes` is not ok)
      keywords = this.state.eventFilter.match(/[^ ]+/g)
    }

    // If the event group doesn't exist, we don't need
    // to try rendering into it
    if (!list[group]) {
      return []
    }

    const events = list[group].map(item => {
      const MessageComponent = messageComponents.get(item.type)

      const args = {
        event: item,
        user: this.state.currentUser,
        team: scopedTeam
      }

      item.message = <MessageComponent {...args} />

      if (filtering) {
        let markup = renderToStaticMarkup(item.message)

        const found = []
        const text = strip(markup)

        for (const word of keywords) {
          // Check if the event message contains the keyword
          // and ignore the case
          if (!new RegExp(word, 'i').test(text)) {
            found.push(false)
            continue
          }

          found.push(true)

          markup = markup.replace(new RegExp(word, 'gi'), (match, offset) => {
            const before = markup.charAt(offset - 1)

            // Don't replace HTML elements
            if (before === '<' || before === '/') {
              return match
            }

            // Highlight the text we've found
            return `<mark>${match}</mark>`
          })
        }

        // Don't include event if it doesn't contain any keywords
        if (!found.every(item => item)) {
          return false
        }

        // Return a React element
        item.message = new HTML().parse(markup)
      }

      return item
    })

    // Filter out falsy events
    return events.filter(item => item)
  }

  scrolled(event) {
    if (!this.loadingIndicator) {
      return
    }

    const { scope, events } = this.state

    // Check if we're already pulling data
    if (this.loading.has(scope)) {
      return
    }

    const section = event.target
    const offset = section.offsetHeight + this.loadingIndicator.offsetHeight
    const distance = section.scrollHeight - section.scrollTop
    const group = this.getCurrentGroup()

    if (!events || !events[scope] || !events[scope][group]) {
      return
    }

    if (distance < offset + 300) {
      const scopedEvents = events[scope][group]
      const lastEvent = scopedEvents[scopedEvents.length - 1]

      retry(() => this.cacheEvents(scope, lastEvent.created), {
        retries: 5,
        factor: 2,
        maxTimeout: 5000
      })
    }
  }

  renderEvents(team) {
    const { scope, events, online, eventFilter } = this.state

    if (!online) {
      return <Loading offline />
    }

    const scopedEvents = events[scope]

    if (!scopedEvents) {
      return <Loading />
    }

    const group = this.getCurrentGroup()
    const filteredEvents = this.filterEvents(scopedEvents, team, group)

    if (filteredEvents.length === 0) {
      return <NoEvents filtered={Boolean(eventFilter)} />
    }

    const months = {}

    for (const message of filteredEvents) {
      const created = parse(message.created)
      const month = format(created, 'MMMM YYYY')

      if (!months[month]) {
        months[month] = []
      }

      months[month].push(message)
    }

    const eventList = month => {
      return months[month].map(content => {
        const args = {
          content,
          currentUser: this.state.currentUser,
          team,
          setScopeWithSlug: this.setScopeWithSlug,
          message: content.message,
          group
        }

        return <EventMessage {...args} key={content.id} />
      })
    }

    // We can't just use `month` as the ID for each heading,
    // because they would glitch around in that case (as
    // the month is the same across scopes)
    return Object.keys(months).map(month => [
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
    const events = this.state.events[scope]
    const group = this.getCurrentGroup()

    if (!events || !events[group] || events[group].length < 30) {
      return
    }

    const teams = this.state.teams
    const relatedTeam = teams.find(item => item.id === scope)

    if (relatedTeam.allCached && relatedTeam.allCached[group]) {
      return (
        <aside ref={this.setReference} name="loadingIndicator">
          <span>{`That's it. No events left to show!`}</span>

          <style jsx>{loaderStyles}</style>
        </aside>
      )
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
    const activeScope = this.detectScope('id', this.state.scope)
    const isUser = this.isUser(activeScope)

    return (
      <main>
        {!this.isWindows && <TopArrow />}

        <div onDragEnter={this.showDropZone}>
          <Title
            setFilter={this.setFilter}
            setSearchRef={this.setReference}
            ref={this.setReference}
            light
            name="title"
            searchShown={Boolean(activeScope)}
            isUser={isUser}
            setTypeFilter={this.setTypeFilter}
          >
            {activeScope ? activeScope.name : 'Now'}
          </Title>

          {this.state.dropZone && <DropZone hide={this.hideDropZone} />}

          <section
            ref={this.setReference}
            onScroll={this.scrolled}
            name="scrollingSection"
          >
            {this.renderEvents(activeScope)}
            {this.loadingOlder()}
          </section>

          <Switcher
            setFeedScope={this.setScope}
            setTeams={this.setTeams}
            currentUser={this.state.currentUser}
            titleRef={this.title}
            onlineStateFeed={this.setOnlineState}
            activeScope={activeScope}
          />
        </div>

        <style jsx>{feedStyles}</style>
        <style jsx global>
          {pageStyles}
        </style>
      </main>
    )
  }
}

export default Feed
