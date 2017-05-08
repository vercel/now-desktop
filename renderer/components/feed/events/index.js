// Packages
import React from 'react'
import { object } from 'prop-types'
import moment from 'moment'

// Utilities
import remote from '../../../utils/electron'

// Components
import messageComponents from './messages'

class EventMessage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      url: null
    }
  }

  openURL(event) {
    event.preventDefault()

    const url = event.target.innerHTML
    remote.shell.openExternal(`https://${url}`)
  }

  open(event) {
    event.preventDefault()

    if (!this.state.url) {
      return
    }

    remote.shell.openExternal(`https://${this.state.url}`)
  }

  componentWillMount() {
    const info = this.props.content

    if (info.payload && info.payload.deploymentUrl) {
      this.setState({
        url: info.payload.deploymentUrl
      })
    }
  }

  render() {
    const info = this.props.content
    const userID = info.user ? info.user.uid : info.userId
    const avatar = `https://zeit.co/api/www/avatar/${userID}`

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = avatar

    const Message = messageComponents.get(info.type)

    if (!Message) {
      return null
    }

    return (
      <figure className="event" onClick={this.open.bind(this)}>
        <img src={avatar} draggable="false" />

        <figcaption>
          <Message
            event={info}
            user={this.props.currentUser}
            team={this.props.team}
          />

          <span>{moment(info.created).fromNow()}</span>
        </figcaption>

        <style jsx>
          {`
          figure {
            margin: 0;
            display: flex;
            justify-content: space-between;
          }

          figure img {
            height: 30px;
            width: 30px;
            border-radius: 30px;
            margin: 15px 0 0 15px;
          }

          figure figcaption {
            border-top: 1px solid #D6D6D6;
            padding: 14px 14px 14px 0;
            width: 345px;
            box-sizing: border-box;
          }

          figure:last-child figcaption {
            padding-bottom: 16px;
          }

          figure:last-child figcaption {
            border-bottom: 0;
          }

          figure figcaption span {
            font-size: 12px;
            color: #9B9B9B;
          }
        `}
        </style>

        <style jsx global>
          {`
          .link {
            color: #000;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
          }

          .link:hover {
            color: #067DF7;
          }

          h1 + .event figcaption {
            border-top: 0 !important;
          }

          .event p {
            font-size: 13px;
            margin: 0;
            line-height: 18px;
            display: block;
          }

          .event span code {
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, serif;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            display: block;
            margin: 2px 0;
            font-size: 12px;
          }
        `}
        </style>
      </figure>
    )
  }
}

EventMessage.propTypes = {
  content: object,
  currentUser: object,
  team: object
}

export default EventMessage
