// Packages
import React, { Component } from 'react'
import setRef from 'react-refs'
import { bool, string } from 'prop-types'

// Styles
import styles from '../../styles/components/tutorial/video'

class Video extends Component {
  constructor(props) {
    super(props)

    this.state = { playing: false }
    this.setRef = setRef.bind(this)
  }

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
    if (name === 'drag-and-drop') {
      return (
        <figcaption>
          <h2>Deploy anything</h2>
          <h1>Drag And Drop any Folder or File</h1>

          <style jsx>{styles}</style>
        </figcaption>
      )
    }

    if (name === 'event-feed') {
      return (
        <figcaption>
          <h2>See Every Event</h2>
          <h1>Your Activity Feed</h1>

          <style jsx>{styles}</style>
        </figcaption>
      )
    }
  }

  render() {
    const { name } = this.props

    const videoSettings = {
      preload: true,
      loop: true,
      src: `/static/tutorial/${name}.webm`,
      ref: this.setRef,
      name: 'video'
    }

    return (
      <figure>
        {this.renderCaption(name)}

        <video {...videoSettings} />
        <style jsx>{styles}</style>
      </figure>
    )
  }
}

Video.propTypes = {
  playing: bool,
  name: string
}

export default Video
