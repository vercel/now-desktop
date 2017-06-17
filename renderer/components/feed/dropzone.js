// Packages
import electron from 'electron'
import React from 'react'
import { func } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/dropzone'

class DropZone extends React.PureComponent {
  constructor(props) {
    super(props)

    this.droppedFile = this.droppedFile.bind(this)
    this.hideDropZone = this.hideDropZone.bind(this)
  }

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
        onDragLeave={this.hideDropZone}
        onDragOver={this.preventDefault}
        onDrop={this.droppedFile}
      >
        <section>
          <span>
            <h1>Drop to Deploy!</h1>
            <p>Your files will be uploaded to <b>now</b>.</p>
          </span>
        </section>

        <style jsx>{styles}</style>
      </aside>
    )
  }
}

DropZone.propTypes = {
  hide: func
}

export default DropZone
