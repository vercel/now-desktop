import { PureComponent } from 'react'
import { func, bool } from 'prop-types'
import styles from '../../styles/components/feed/dropzone'

class DropZone extends PureComponent {
  hideDropZone = () => {
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

  droppedFile = event => {
    this.hideDropZone()

    if (!event.dataTransfer || !event.dataTransfer.files) {
      return
    }

    const { files } = event.dataTransfer
    const list = [...files].map(file => file.path)

    console.log(list)

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
        <section className={this.props.darkBg ? 'dark' : ''}>
          <span>
            <h1>Drop to Deploy</h1>
            <p>
              Your files will be uploaded to <b>Now</b>.
            </p>
          </span>
        </section>

        <style jsx>{styles}</style>
      </aside>
    )
  }
}

DropZone.propTypes = {
  darkBg: bool,
  hide: func
}

export default DropZone
