// Packages
import React from 'react'
import { object } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    const { info } = props
    const userID = info.user ? info.user.uid : info.userId
    const url = `https://zeit.co/api/www/avatar/${userID}`

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = url

    this.state = { url }
  }

  render() {
    return (
      <div>
        <img src={this.state.url} draggable="false" />

        <style jsx>
          {`
          img {
            height: 30px;
            width: 30px;
            border-radius: 30px;
            margin: 15px 0 0 15px;
          }
        `}
        </style>
      </div>
    )
  }
}

Avatar.propTypes = {
  info: object
}

export default Avatar
