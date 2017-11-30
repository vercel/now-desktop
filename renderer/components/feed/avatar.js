// Packages
import React from 'react'
import { object, bool, number, string } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/avatar'

class Avatar extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      url: null,
      title: null,
      scaled: false
    }
  }

  componentWillMount() {
    this.setURL()
    this.setTitle()
  }

  componentDidMount() {
    if (!this.props.scale) {
      return
    }

    if (!this.state.scaled) {
      this.prepareScale(this.props.delay)
    }
  }

  async setURL() {
    const { event, team, isUser, group, hash } = this.props

    if (group && group === 'system') {
      this.setState({
        url: `/static/geist.png`
      })

      return
    }

    let validUser = event || isUser
    let id

    if (Object.keys(team) > 0) {
      validUser = false
    }

    if (event) {
      id = event.user ? event.user.uid : event.userId
    } else {
      id = team.id
    }

    let imageID = validUser ? id : `?teamId=${team.id}`
    let separator = validUser ? '?' : '&'

    if (hash) {
      imageID = hash
      separator = '?'
    }

    this.setState({
      url: `https://zeit.co/api/www/avatar/${imageID}${separator}s=80`
    })
  }

  async setTitle() {
    const { event, team, isUser } = this.props
    let title

    if (event && event.user) {
      title = event.user.username
    }

    if ((team && !isUser) || (!event && isUser)) {
      title = team.name || 'You'
    }

    this.setState({ title })
  }

  prepareScale(delay) {
    const when = 100 + 100 * delay

    setTimeout(() => {
      this.setState({
        scaled: true
      })
    }, when)
  }

  render() {
    let classes = this.props.event ? 'in-event' : ''

    if (this.props.scale) {
      classes += ' scale'
    }

    if (this.state.scaled) {
      classes += ' scaled'
    }

    return (
      <div>
        <img
          src={this.state.url}
          title={this.state.title}
          draggable="false"
          className={classes}
        />

        <style jsx>{styles}</style>
      </div>
    )
  }
}

Avatar.propTypes = {
  team: object,
  event: object,
  isUser: bool,
  scale: bool,
  delay: number,
  group: string,
  hash: string
}

export default Avatar
