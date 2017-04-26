// Packages
import React from 'react'
import moment from 'moment'

// Components
import Title from '../components/title'
import Switcher from '../components/feed/switcher'
import DropZone from '../components/feed/dropzone'
import TopArrow from '../components/feed/top-arrow'
import EventMessage from '../components/feed/event'

// Utilities
import { getConfig, getCache } from '../utils/data'

class Feed extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dropZone: false,
      events: false
    }
  }

  async componentDidMount() {
    const config = await getConfig()
    this.setScope(config.user.username)
  }

  async setScope(scope) {
    const events = await getCache('events.' + scope)

    this.setState({
      events: events || false
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

  renderEvents() {
    if (!this.state.events) {
      return <span>No events!</span>
    }

    const events = this.state.events
    const months = {}

    for (const message of events) {
      const created = moment(message.created)
      const month = created.format('MMMM YYYY')

      if (!months[month]) {
        months[month] = []
      }

      months[month].push(message)
    }

    const eventList = month =>
      months[month].map(item => {
        return <EventMessage content={item} key={item.id} />
      })

    return Object.keys(months).map(month => (
      <div key={month}>
        <h1>{month}</h1>
        {eventList(month)}

        <style jsx>
          {`
          h1 {
            background: #F5F5F5;
            font-size: 13px;
            height: 30px;
            line-height: 30px;
            padding: 0 10px;
            color: #000;
            margin: 0;
            position: sticky;
            top: 0;
          }
        `}
        </style>
      </div>
    ))
  }

  render() {
    const dropZoneRef = zone => {
      this.dropZone = zone
    }

    return (
      <main>
        <TopArrow />

        <div onDragEnter={this.showDropZone.bind(this)}>
          <Title light>Now</Title>

          {this.state.dropZone &&
            <DropZone ref={dropZoneRef} hide={this.hideDropZone.bind(this)} />}

          <section>
            {this.renderEvents()}
          </section>

          <Switcher setFeedScope={this.setScope.bind(this)} />
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
            overflow: scroll;
            background: #fff;
            user-select: none;
            cursor: default;
            flex-shrink: 1;
            position: relative;
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
