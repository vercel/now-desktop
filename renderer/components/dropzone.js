// Packages
import React from 'react'
import { func } from 'prop-types'

// Utilities
import remote from '../utils/electron'

class DropZone extends React.Component {
  componentDidMount() {
    this.deploy = remote.require('./actions/deploy')
  }

  droppedFile(event) {
    if (this.props.hide) {
      this.props.hide()
    }

    if (!event.dataTransfer || !event.dataTransfer.files) {
      return
    }

    const item = event.dataTransfer.files[0].path

    // Shoot it into the cloud
    this.deploy(item)

    // And prevent the window from loading the file inside it
    event.preventDefault()
  }

  render() {
    return (
      <aside>
        <section>
          <h1>Drop to Deploy!</h1>
          <p>Your files will be deployed to now.</p>
        </section>

        <style jsx>
          {`
          aside {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 300px;
            background: #fff;
            z-index: 20000;
            transform: translate(-50%, -50%);
            overflow: hidden;
            padding: 10px;
            box-sizing: border-box;
          }

          section {
            display: block;
            border: 2px dashed #d0d0d0;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          h1, p {
            margin: 0;
          }
        `}
        </style>
      </aside>
    )
  }
}

DropZone.propTypes = {
  hide: func
}

export default DropZone
