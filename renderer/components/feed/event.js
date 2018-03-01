// Packages
import electron from 'electron'
import { PureComponent } from 'react'
import { object, func, string } from 'prop-types'
import dotProp from 'dot-prop'
import ms from 'ms'

// Styles
import { localStyles, globalStyles } from '../../styles/components/feed/event'

// Utilities
import dateDiff from '../../utils/date-diff'

// Components
import Avatar from './avatar'

class EventMessage extends PureComponent {
  state = {
    url: null
  }

  remote = electron.remote || false
  menu = null

  click = () => {
    const { content, setScopeWithSlug } = this.props

    if (content.type === 'team' && setScopeWithSlug) {
      setScopeWithSlug(content.payload.slug)
      return
    }

    if (!this.state.url) {
      return
    }

    if (!this.remote) {
      return
    }

    this.remote.shell.openExternal(`https://${this.state.url}`)
  }

  rightClick = event => {
    event.preventDefault()

    if (!this.menu) {
      return
    }

    this.menu.popup({
      x: event.clientX,
      y: event.clientY,
      async: true
    })
  }

  copyToClipboard(text) {
    if (!this.remote) {
      return
    }

    this.remote.clipboard.writeText(text)
  }

  getID() {
    const info = this.props.content

    const props = [
      'payload.deletedUser.username',
      'payload.slug',
      'payload.aliasId',
      'payload.deploymentId'
    ]

    for (const prop of props) {
      const id = dotProp.get(info, prop)

      if (id) {
        return id
      }
    }

    return null
  }

  getDashboardURL() {
    const content = this.props.content

    if (content.type !== 'deployment') {
      return null
    }

    const { deploymentUrl, url } = content.payload
    const host = deploymentUrl || url

    return `https://zeit.co/deployments/${host}`
  }

  componentDidMount() {
    if (!this.remote) {
      return
    }

    const Menu = this.remote.Menu
    const eventItem = this
    const menuContent = []

    if (this.state.url) {
      menuContent.push({
        label: 'Copy URL',
        click() {
          const url = `https://${eventItem.state.url}`
          eventItem.copyToClipboard(url, 'address')
        }
      })
    }

    const identificator = this.getID()
    const dashboardURL = this.getDashboardURL()

    if (identificator) {
      menuContent.push({
        label: 'Copy ID',
        click() {
          eventItem.copyToClipboard(identificator, 'ID')
        }
      })
    }

    if (dashboardURL) {
      if (menuContent.length > 0) {
        menuContent.push({
          type: 'separator'
        })
      }

      menuContent.push({
        label: 'Open in Dashboard',
        click() {
          if (!eventItem.remote) {
            return
          }

          eventItem.remote.shell.openExternal(dashboardURL)
        }
      })
    }

    if (menuContent.length === 0) {
      return
    }

    this.menu = Menu.buildFromTemplate(menuContent)
  }

  componentWillMount() {
    const info = this.props.content

    const urlProps = [
      'payload.cn',
      'payload.alias',
      'payload.url',
      'payload.domain',
      'payload.deploymentUrl'
    ]

    for (const prop of urlProps) {
      const url = dotProp.get(info, prop)

      if (url) {
        this.setState({ url })
        break
      }
    }
  }

  parseDate(date) {
    const current = new Date()
    const difference = dateDiff(current, date, 'milliseconds')

    const checks = {
      '1 minute': 'seconds',
      '1 hour': 'minutes',
      '1 day': 'hours',
      '7 days': 'days',
      '30 days': 'weeks',
      '1 year': 'months'
    }

    for (const check in checks) {
      if (!{}.hasOwnProperty.call(checks, check)) {
        continue
      }

      const unit = checks[check]
      const shortUnit = unit === 'months' ? 'mo' : unit.charAt(0)

      if (difference < ms(check)) {
        return dateDiff(current, date, unit) + shortUnit
      }
    }

    return null
  }

  render() {
    const { message, content, team, group } = this.props
    const avatarHash = content.user && content.user.avatar

    return (
      <figure
        className="event"
        onClick={this.click}
        onContextMenu={this.rightClick}
      >
        <Avatar event={content} team={team} group={group} hash={avatarHash} />

        <figcaption>
          {message}
          <span>{this.parseDate(content.created)}</span>
        </figcaption>

        <style jsx>{localStyles}</style>
        <style jsx global>
          {globalStyles}
        </style>
      </figure>
    )
  }
}

EventMessage.propTypes = {
  content: object,
  currentUser: object,
  team: object,
  setScopeWithSlug: func,
  message: object,
  group: string
}

export default EventMessage
