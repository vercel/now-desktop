// Native
import queryString from 'querystring'

// Packages
import electron from 'electron'
import { Fragment, Component } from 'react'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import isEqual from 'react-fast-compare'
import setRef from 'react-refs'
import { renderToStaticMarkup } from 'react-dom/server'
import strip from 'strip'
import parseHTML from 'html-to-react'
import retry from 'async-retry'
import ms from 'ms'
import makeUnique from 'make-unique'

// Components
import Title from '../components/title'
import Switcher from '../components/feed/switcher'
import DropZone from '../components/feed/dropzone'
import EventMessage from '../components/feed/event'
import NoEvents from '../components/feed/none'
import Loading from '../components/feed/loading'
import messageComponents from '../components/feed/messages'
import isDarkMode from '../utils/dark-mode'

// Utilities
import loadData from '../utils/data/load'
import { API_EVENTS, API_USER } from '../utils/data/endpoints'

// Styles
import {
  feedStyles,
  headingStyles,
  loaderStyles,
  pageStyles
} from '../styles/pages/feed'

class Feed extends Component {
  state = {
    dropZone: false,
    events: {},
    scope: null,
    currentUser: null,
    teams: [],
    eventFilter: null,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    typeFilter: 'team',
    darkMode: false,
    hasLoaded: false
  }

  remote = electron.remote || false
  ipcRenderer = electron.ipcRenderer || false
  loading = new Set()
  isWindows = process.platform === 'win32'
  eventTypes = this.getEventTypes()
  setReference = setRef.bind(this)

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
        await this.cacheEvents(team.id)
      } catch (err) {
        console.log(err)
      }
    }
  }

  getEventTypes() {
    const auto = new Set([
      'scale',
      'scale-auto',
      'deployment-freeze',
      'deployment-unfreeze',
      'cert-autorenew',
      'alias-system',
      'domain-transfer-in-canceled',
      'domain-transfer-in-completed'
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

  async cacheEvents(scope, until, track) {
    const types = this.eventTypes
    const { teams, currentUser, scope: activeScope } = this.state

    if (until) {
      track = true
    }

    if (track) {
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
      if (track) {
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
      const hasEvents = result && result.length > 0

      newEvents[group] = result

      if (!hasEvents && events[scope] && events[scope][group]) {
        if (until) {
          teams[relatedCacheIndex].allCached[group] = true

          this.setState({ teams }, () => {
            this.loading.delete(scope)
          })
        }

        // We had `return` here before, which was most
        // likely causing the event stream to get stuck if
        // there were no new ones in a certain group,
        // although the other groups might still have had new events.
        continue
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
        const isCurrent = relatedCache.id === activeScope
        const scrollPosition = this.scrollingSection.scrollTop

        let shouldKeep

        // Ensure that never more than 50 events are cached. But only
        // if infinite scrolling is not being used.
        if (until || (isCurrent && scrollPosition > 0)) {
          shouldKeep = true
        }

        events[scope][group] = shouldKeep ? unique : unique.slice(0, 50)
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
        if (track) {
          this.loading.delete(scope)
        }
      }
    )
  }

  onKeyDown = event => {
    const currentWindow = this.remote.getCurrentWindow()
    const { keyCode, metaKey } = event

    if (keyCode === 86 && metaKey) {
      const { deploy } = this.remote.require('./utils/deploy-from-clipboard')
      deploy()
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

  listenThemeChange() {
    if (!this.ipcRenderer) {
      return
    }

    this.ipcRenderer.on('theme-changed', this.onThemeChanged)
  }

  listenToUserChange() {
    if (!this.ipcRenderer) {
      return
    }

    // Update the `currentUser` state to reflect
    // switching the account using `now login`
    this.ipcRenderer.on('config-changed', this.onConfigChanged)
  }

  clearScroll = () => {
    if (!this.scrollingSection) {
      return
    }

    this.scrollingSection.scrollTop = 0
  }

  lineStates = ['online', 'offline']

  showWindow = () => {
    this.setOnlineState()

    // Ensure that scrolling position only gets
    // resetted if the window was closed for 5 seconds
    clearTimeout(this.scrollTimer)
  }

  hideWindow = () => {
    this.setOnlineState()

    // Clear scrolling position if window closed for 5 seconds
    this.scrollTimer = setTimeout(this.clearScroll, ms('5s'))
  }

  onConfigChanged = async (event, config) => {
    const { token } = config

    let user = {}

    // It's very important to not use `this.state` here
    if (navigator.onLine) {
      ;({ user } = await loadData(API_USER, token))
    }

    if (isEqual(this.state.currentUser, user)) {
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
  }

  onThemeChanged = (event, config) => {
    const { darkMode } = config

    this.setState({ darkMode })
  }

  async componentDidMount() {
    // Support SSR
    if (typeof window === 'undefined') {
      return
    }

    for (const state of this.lineStates) {
      window.addEventListener(state, this.setOnlineState)
    }

    if (!this.remote) {
      return
    }

    const { getConfig } = this.remote.require('./utils/config')

    let config = {}
    let user = {}

    try {
      config = await getConfig()
    } catch (err) {
      // Nothing to do here, as there is a default
    }

    // It's very important to not use `this.state` here
    if (navigator.onLine) {
      ;({ user } = await loadData(API_USER, config.token))
    }

    this.setState({
      scope: user.uid,
      currentUser: user,
      darkMode: isDarkMode(this.remote),
      hasLoaded: true
    })

    // Listen to system darkMode system change
    this.listenThemeChange()

    // Switch the `currentUser` property if config changes
    this.listenToUserChange()

    // And then allow hiding the windows using the keyboard
    document.addEventListener('keydown', this.onKeyDown)

    const currentWindow = this.remote.getCurrentWindow()

    currentWindow.on('show', this.showWindow)
    currentWindow.on('hide', this.hideWindow)

    window.addEventListener('beforeunload', () => {
      currentWindow.removeListener('show', this.showWindow)
      currentWindow.removeListener('hide', this.hideWindow)
    })
  }

  componentWillUnmount() {
    for (const state of this.lineStates) {
      window.removeEventListener(state, this.setOnlineState)
    }

    document.removeEventListener('keydown', this.onKeyDown)

    this.ipcRenderer.removeListener('config-changed', this.onConfigChanged)
    this.ipcRenderer.removeListener('theme-changed', this.onThemeChanged)
  }

  setOnlineState = async () => {
    const online = navigator.onLine

    if (online === this.state.online) {
      return
    }

    if (!online) {
      this.setState({ online })
      return
    }

    const { getConfig } = this.remote.require('./utils/config')

    let config = null

    try {
      config = await getConfig()
    } catch (err) {
      return
    }

    const { user: currentUser } = await loadData(API_USER, config.token)

    this.setState({
      online,
      currentUser,
      scope: config.currentTeam ? config.currentTeam : currentUser.uid
    })
  }

  showDropZone = () => {
    this.setState({ dropZone: true })
  }

  hideDropZone = () => {
    this.setState({ dropZone: false })
  }

  setTypeFilter = type => {
    this.setState({ typeFilter: type })
  }

  setScope = scope => {
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

  setScopeWithSlug = slug => {
    const detected = this.detectScope('slug', slug)

    if (detected && this.state.scope !== detected.id) {
      this.setScope(detected.id)
    }
  }

  detectScope(property, value) {
    return this.state.teams.find(team => team[property] === value)
  }

  setTeams = async (teams, firstLoad) => {
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

  setFilter = eventFilter => {
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

      if (!MessageComponent) {
        return null
      }

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

        keywords.sort((a, b) => b.length - a.length)

        for (const word of keywords) {
          // Check if the event message contains the keyword
          // and ignore the case
          if (!new RegExp(word, 'i').test(text)) {
            found.push(false)
            continue
          }

          found.push(true)

          markup = markup.replace(
            new RegExp(
              '(?!<mark[^>]*?>)(' + word + ')(?![^<]*?</mark>)(?![^<]*>)',
              'gi'
            ),
            match => {
              // Highlight the text we've found
              return `<mark>${match}</mark>`
            }
          )
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

  scrolled = event => {
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
    const { scope, events, online, eventFilter, darkMode } = this.state

    if (!online) {
      return <Loading darkBg={darkMode} offline />
    }

    const scopedEvents = events[scope]

    if (!scopedEvents) {
      return <Loading darkBg={darkMode} />
    }

    const group = this.getCurrentGroup()
    const filteredEvents = this.filterEvents(scopedEvents, team, group)

    if (filteredEvents.length === 0) {
      return (
        <NoEvents
          filtered={Boolean(eventFilter)}
          darkBg={this.state.darkMode}
        />
      )
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
          group,
          darkBg: this.state.darkMode
        }

        return <EventMessage {...args} key={content.id} />
      })
    }

    // We can't just use `month` as the ID for each heading,
    // because they would glitch around in that case (as
    // the month is the same across scopes)
    return Object.keys(months).map(month => [
      <h1 className={this.state.darkMode ? 'dark' : ''} key={scope + month}>
        {month}
        <style jsx>{headingStyles}</style>
      </h1>,
      eventList(month)
    ])
  }

  loadingOlder() {
    const { events: eventList, eventFilter, scope, darkMode } = this.state

    if (eventFilter) {
      return
    }

    const events = eventList[scope]
    const group = this.getCurrentGroup()

    if (!events || !events[group] || events[group].length < 30) {
      return
    }

    const teams = this.state.teams
    const relatedTeam = teams.find(item => item.id === scope)
    const allCached = relatedTeam.allCached && relatedTeam.allCached[group]

    return (
      <aside
        ref={item => {
          this.loadingIndicator = item
        }}
        className={darkMode ? 'dark' : ''}
      >
        {allCached ? (
          <span key="description">{`That's it. No events left to show!`}</span>
        ) : (
          <Fragment>
            <img key="animation" src="/static/loading.gif" />
            <span key="description">Loading Older Events...</span>
          </Fragment>
        )}

        <style jsx>{loaderStyles}</style>
      </aside>
    )
  }

  render() {
    const activeScope = this.detectScope('id', this.state.scope)
    const isUser = this.isUser(activeScope)

    if (!this.state.hasLoaded) {
      return null
    }

    return (
      <main>
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
            darkBg={this.state.darkMode}
          >
            {activeScope ? activeScope.name : 'Now'}
          </Title>

          {this.state.dropZone && (
            <DropZone darkBg={this.state.darkMode} hide={this.hideDropZone} />
          )}

          <section
            className={this.state.darkMode ? 'dark' : ''}
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
            online={this.state.online}
            activeScope={activeScope}
            darkBg={this.state.darkMode}
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
