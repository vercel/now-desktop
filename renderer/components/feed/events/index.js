// Packages
import electron from 'electron'
import React from 'react'
import { object } from 'prop-types'
import moment from 'moment'
import dotProp from 'dot-prop'

// Components
import Avatar from '../avatar'
import messageComponents from './messages'

class EventMessage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      url: null
    }
  }

  open(event) {
    event.preventDefault()

    if (!this.state.url) {
      return
    }

    const remote = electron.remote || false

    if (!remote) {
      return
    }

    remote.shell.openExternal(`https://${this.state.url}`)
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
  render() {
    const info = this.props.content
    const Message = messageComponents.get(info.type)

    if (!Message) {
      return null
    }

    return (
      <figure className="event" onClick={this.open.bind(this)}>
        <Avatar event={info} team={this.props.team} />

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

          figure:hover {
            background: #F5F5F5;
          }

          figure figcaption {
            border-top: 1px solid #F5F5F5;
            padding: 10px 10px 10px 0;
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
            font-size: 11px;
            color: #9B9B9B;
            display: none;
          }
        `}
        </style>

        <style jsx global>
          {`
          h1 + .event figcaption {
            border-top: 0 !important;
          }

          .event p {
            font-size: 12px;
            margin: 0;
            line-height: 16px;
            display: block;
            color: #666;
          }

          .event p b {
            font-weight: normal;
            color: #000;
          }

          .event p code {
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, serif;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 12px;
            margin: 5px 0;
            display: block;
          }

          .event:hover p code {
            background: #e8e8e8;
          }

          .event:hover + .event figcaption {
            border-top-color: transparent;
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
