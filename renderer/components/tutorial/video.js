// Packages
import { Component } from 'react'
import setRef from 'react-refs'
import { bool, string } from 'prop-types'

// Styles
import {
  coreStyles,
  captionStyles
} from '../../styles/components/tutorial/video'

class Video extends Component {
  state = {
    playing: false
  }

  setRef = setRef.bind(this)
  os = process.platform === 'darwin' ? 'mac' : 'windows'

  componentWillReceiveProps(nextProps) {
    const already = this.state.playing

    if (!nextProps.playing) {
      if (already) {
        this.setState({
          playing: false
        })
      }

      return
    }

    this.setState({
      playing: true
    })
  }

  componentWillUpdate(nextProps, nextState) {
    const video = this.video

    if (!video) {
      return
    }

    if (!nextState.playing) {
      if (!video.paused) {
        video.pause()
        video.currentTime = 0
      }

      return
    }

    video.play()
  }

  renderCaption(name) {
    if (name === 'deploying') {
      return (
        <figcaption>
          <h2>Deploy anything</h2>
          <h1>
            {this.os === 'mac' ? 'Drag And Drop' : 'Select'} any Folder or File
          </h1>

          <style jsx>{captionStyles}</style>
        </figcaption>
      )
    }

    if (name === 'feed') {
      return (
        <figcaption>
          <h2>See Every Event</h2>
          <h1>Your Activity Feed</h1>

          <style jsx>{captionStyles}</style>
        </figcaption>
      )
    }
  }

  render() {
    const { name } = this.props

    const videoSettings = {
      preload: 'true',
      loop: true,
      src: `/static/tutorial/${this.os}/${name}.webm`,
      ref: this.setRef,
      name: 'video'
    }

    return (
      <figure>
        {this.renderCaption(name)}

        <video {...videoSettings} />
        <style jsx>{coreStyles}</style>
      </figure>
    )
  }
}

Video.propTypes = {
  playing: bool,
  name: string
}

export default Video
