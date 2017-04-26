// Packages
import React from 'react'
import { object, bool } from 'prop-types'

// Utilities
import remote from '../../utils/electron'

class EventMessage extends React.Component {
  openURL(event) {
    event.preventDefault()

    const url = event.target.innerHTML
    remote.shell.openExternal(`https://${url}`)
  }

  getDescription() {
    const details = this.props.content
    const type = details.type

    const list = [<b>You</b>, ' ']

    if (type === 'deployment') {
      list.push([
        'deployed ',
        <a className="link" onClick={this.openURL}>{details.payload.url}</a>
      ])
    }

    return list
  }

  render() {
    return (
      <figure className={this.props.isFirst ? 'first' : ''}>
        <img src="https://zeit.co/api/www/avatar/?u=evilrabbit&s=80" />
        <figcaption>
          <p>
            {this.getDescription()}
          </p>
          <span>2m ago</span>
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

          figure.first figcaption {
            border-top: 0;
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

          figure figcaption p {
            font-size: 13px;
            margin: 0;
            line-height: 18px;
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
        `}
        </style>
      </figure>
    )
  }
}

EventMessage.propTypes = {
  content: object,
  isFirst: bool
}

export default EventMessage
