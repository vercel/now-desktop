// Packages
import React from 'react'
import { object } from 'prop-types'
import moment from 'moment'

// Utilities
import remote from '../../../utils/electron'

// Components
import messageComponents from './messages'

class EventMessage extends React.Component {
  openURL(event) {
    event.preventDefault()

    const url = event.target.innerHTML
    remote.shell.openExternal(`https://${url}`)
  }

  render() {
    const info = this.props.content
    const userID = info.user ? info.user.uid : info.user_id
    const avatar = `https://zeit.co/api/www/avatar/${userID}`

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = avatar

    const Message = messageComponents.get(info.type)

    if (!Message) {
      return null
    }

    return (
      <figure className="event">
        <img src={avatar} />

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

          .event span:first-child {
            font-size: 13px;
            margin: 0;
            line-height: 18px;
            display: block;
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
