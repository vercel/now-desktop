// Native
import os from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import PropTypes from 'prop-types'
import setRef from 'react-refs'

// Styles
import styles from '../styles/components/title'

// Components
import Done from '../vectors/done'
import Deploy from '../vectors/deploy'
import Search from './feed/search'

class Title extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = { updateMessage: false }
    this.setReference = setRef.bind(this)

    const toBind = ['selectToDeploy', 'hideDeployIcon', 'showDeployIcon']

    for (const bindable of toBind) {
      this[bindable] = this[bindable].bind(this)
    }
  }

  componentDidMount() {
    const remote = electron.remote || false

    if (!remote) {
      return
    }

    this.dialogs = remote.require('./dialogs')
  }

  selectToDeploy() {
    this.dialogs.deploy()
  }

  hideDeployIcon() {
    this.deployIcon.classList.add('hidden')
  }

  showDeployIcon() {
    this.deployIcon.classList.remove('hidden')
  }

  scopeUpdated() {
    if (this.state.updateMessage) {
      return
    }

    this.setState({
      updateMessage: true
    })

    setTimeout(() => {
      this.setState({
        updateMessage: false
      })
    }, 2000)
  }

  render() {
    const classes = []

    if (this.props.light) {
      classes.push('light')
    }

    if (os.platform() === 'win32') {
      classes.push('windows')
    }

    if (this.state.updateMessage) {
      classes.push('scope-updated')
    }

    return (
      <aside className={classes.join(' ')}>
        <div>
          {this.props.light &&
            this.props.searchShown &&
            <Search
              hideDeployIcon={this.hideDeployIcon}
              showDeployIcon={this.showDeployIcon}
              setFeedFilter={this.props.setFilter || false}
              setSearchRef={this.props.setSearchRef || false}
            />}

          <h1>{this.props.children}</h1>

          {this.props.light &&
            <span
              className="deploy"
              onClick={this.selectToDeploy}
              ref={this.setReference}
              name="deployIcon"
            >
              <Deploy />
            </span>}
        </div>

        <section>
          <Done />
          <p>Context updated for now CLI!</p>
        </section>

        <style jsx>{styles}</style>
      </aside>
    )
  }
}

Title.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element.isRequired
  ]),
  light: PropTypes.bool,
  setFilter: PropTypes.func,
  setSearchRef: PropTypes.func,
  searchShown: PropTypes.bool
}

export default Title
