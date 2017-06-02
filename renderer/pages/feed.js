// Native
import queryString from 'querystring'

// Packages
import electron from 'electron'
import React from 'react'
import moment from 'moment'
import dotProp from 'dot-prop'
import makeUnique from 'make-unique'

// Components
import Title from '../components/title'
import Switcher from '../components/feed/switcher'
import DropZone from '../components/feed/dropzone'
import TopArrow from '../components/feed/top-arrow'
import EventMessage from '../components/feed/events'
import NoEvents from '../components/feed/events/none'
import Loading from '../components/feed/events/loading'

class Feed extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dropZone: false,
      events: {},
      scope: null,
      currentUser: null,
      teams: [],
      eventFilter: null
    }

    this.remote = electron.remote || false
  }

  async updateEvents(excludeID) {
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
      const isUser = focusedIndex === 0

      this.loadEvents(focusedTeam.id, isUser)
    }

    // Update the feed of events for each team
    for (const team of teams) {
      const index = teams.indexOf(team)

      if (excludeID && team.id === excludeID) {
        continue
      }

      // Don't load the focused team, because we updated
      // that one already above. We need to test for `undefined` here
      // because checking if falsy is not ok since the value might
      // be `0` (beginning of `teams` array)
      if (focusedIndex !== undefined && index === focusedIndex) {
        continue
      }

      const isUser = index === 0

      // Wait for the requests to finish (`await`), otherwise
      // the server will get confused and throw an error
      await this.loadEvents(team.id, isUser)
    }
  }

  async loadEvents(scope, isUser) {
    if (!this.remote) {
      return
    }

    const loadData = this.remote.require('./utils/data/load')
    const { API_EVENTS } = this.remote.require('./utils/data/endpoints')

    const teams = this.state.teams
    const relatedCache = teams.find(item => item.id === scope)
    const lastUpdate = relatedCache.lastUpdate

    const query = {
      limit: 15
    }

    if (!isUser) {
      query.teamId = scope
    }

    if (typeof relatedCache !== 'undefined' && lastUpdate) {
      query.since = lastUpdate
    }

    const params = queryString.stringify(query)
    let data

    try {
      data = await loadData(`${API_EVENTS}?${params}`)
    } catch (err) {}

    if (!data || !data.events) {
      return
    }

    const events = this.state.events
    const relatedCacheIndex = teams.indexOf(relatedCache)
    const scopedEvents = events[scope]

    teams[relatedCacheIndex].lastUpdate = data.events[0].created

    if (scopedEvents) {
      const merged = data.events.concat(scopedEvents)
      const unique = makeUnique(merged, (a, b) => a.id === b.id)

      // Ensure that never more than 40 events are cached
      events[scope] = unique.slice(0, 40)
    } else {
      events[scope] = data.events
    }

    this.setState({ events, teams })
  }

  hideWindow(event) {
    if (!event || !event.keyCode) {
      return
    }

    if (event.keyCode === 27) {
      const activeItem = document.activeElement

      if (activeItem && activeItem.tagName === 'INPUT') {
        return
      }

      const currentWindow = this.remote.getCurrentWindow()
      currentWindow.hide()
    }
  }

  async componentWillMount() {
    if (!this.remote) {
      return
    }

    const { getConfig } = this.remote.require('./utils/config')
    const config = await getConfig()

    this.setState({
      scope: config.user.uid,
      currentUser: config.user
    })

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

  renderEvents() {
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

    // We need to force-re-render each heading
    // because the sticky styling would otherwise glitch
    // around when switching the scope (Math.random)
    return monthKeys.map(month => [
      <h1 key={Math.random()}>
        {month}

        <style jsx>
          {`
          h1 {
            background: #F5F5F5;
            font-size: 10px;
            height: 23px;
            line-height: 23px;
            padding: 0 10px;
            color: #000;
            margin: 0;
            position: sticky;
            top: 0;
            text-transform: uppercase;
            font-weight: 200;
          }
        `}
        </style>
      </h1>,
      eventList(month)
    ])
  }

  render() {
    const setRef = (name, element) => {
      this[name] = element
    }

    const scope = this.state.scope
    const searchShown = this.getEvents(scope) && true

    return (
      <main>
        <TopArrow />

        <div onDragEnter={this.showDropZone.bind(this)}>
          <Title
            light
            setFilter={this.setFilter.bind(this)}
            setSearchRef={setRef.bind(this, 'searchField')}
            searchShown={searchShown}
          >
            Now
          </Title>

          {this.state.dropZone &&
            <DropZone
              ref={setRef.bind(this, 'dropZone')}
              hide={this.hideDropZone.bind(this)}
            />}

          <section ref={setRef.bind(this, 'scrollingSection')}>
            {this.renderEvents(scope)}
            {!this.state.eventFilter && <aside>Loading holder events...</aside>}
          </section>

          <Switcher
            setFeedScope={this.setScope.bind(this)}
            setTeams={this.setTeams.bind(this)}
            currentUser={this.state.currentUser}
          />
        </div>

        <style jsx>
          {`
          main, div {
            display: flex;
            flex-direction: column;
          }

          main {
            height: 100vh;
          }

          div {
            flex-shrink: 1;
            position: relative;
          }

          section {
            overflow-y: auto;
            overflow-x: hidden;
            background: #fff;
            user-select: none;
            cursor: default;
            flex-shrink: 1;
            position: relative;
          }

          aside {
            font-size: 12px;
            color: #666666;
            text-align: center;
            background: #F5F5F5;
            padding: 12px 0;
          }

          /*
            This is required because the element always needs
            to be at least as high as the remaining space, flex
            will shrink it down then
          */

          section {
            height: 100vh;
          }
        `}
        </style>

        <style jsx global>
          {`
          body {
            font-family: BlinkMacSystemFont;
            -webkit-font-smoothing: antialiased;
            margin: 0;
            overflow: hidden;
          }
        `}
        </style>
      </main>
    )
  }
}

export default Feed
