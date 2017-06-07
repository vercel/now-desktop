// Packages
import electron from 'electron'
import React from 'react'
import { func } from 'prop-types'

class DropZone extends React.PureComponent {
  componentDidMount() {
    const remote = electron.remote || false
    this.deploy = remote.require('./utils/deploy')
  }

  hideDropZone() {
    if (this.props.hide) {
      this.props.hide()
    }
  }

  preventDefault(event) {
    // Make the cursor look good
    event.dataTransfer.effectAllowed = 'copyMove'
    event.dataTransfer.dropEffect = 'copy'

    event.preventDefault()
  }

  droppedFile(event) {
    this.hideDropZone()

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
      <aside
        onDragLeave={this.hideDropZone.bind(this)}
        onDragOver={this.preventDefault}
        onDrop={this.droppedFile.bind(this)}
      >
        <section>
          <span>
            <h1>Drop to Deploy!</h1>
            <p>Your files will be uploaded to <b>now</b>.</p>
          </span>
        </section>

        <style jsx>
          {`
          aside {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: transparent;
            z-index: 20000;
            overflow: hidden;
          }

          section {
            display: block;
            height: 291px;
            background: #fff;
            padding: 10px;
            box-sizing: border-box;
            width: 100%;
            margin-top: 36px;
            pointer-events: none;
          }

          span {
            display: block;
            border: 1px dashed #d0d0d0;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          h1 {
            font-size: 16px;
            margin-bottom: 7px;
          }

          p {
            text-align: center;
            font-size: 12px;
            width: 250px;
            line-height: 20px;
          }

          b {
            font-weight: normal;
            text-decoration: underline;
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
