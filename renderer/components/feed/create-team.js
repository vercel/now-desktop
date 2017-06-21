// Packages
import React from 'react'
import { number, bool } from 'prop-types'

// Styles
import styles from '../../styles/components/feed/create-team'

class CreateTeam extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { scaled: false }
  }

  componentDidMount() {
    if (!this.props.scale) {
      return
    }

    if (!this.state.scaled) {
      this.prepareScale(this.props.delay)
    }
  }

  prepareScale(delay) {
    if (delay === 0) {
      return
    }

    const when = 100 + 100 * delay

    setTimeout(() => {
      this.setState({
        scaled: true
      })
    }, when)
  }

  render() {
    const classes = []

    if (this.props.scale) {
      classes.push('scale')
    }

    if (this.state.scaled) {
      classes.push('scaled')
    }

    return (
      <li
        onClick={this.createTeam}
        title="Create a Team"
        className={classes.join(' ')}
      >
        <i />
        <i />

        <style jsx>{styles}</style>
      </li>
    )
  }
}

CreateTeam.propTypes = {
  delay: number,
  scale: bool
}

export default CreateTeam
