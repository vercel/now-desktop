// Native
import os from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import PropTypes from 'prop-types'

// Components
import Done from '../vectors/done'
import Deploy from '../vectors/deploy'
import Search from './feed/search'

class Title extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      updateMessage: false
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
    const deployIconRef = icon => {
      this.deployIcon = icon
    }

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
              hideDeployIcon={this.hideDeployIcon.bind(this)}
              showDeployIcon={this.showDeployIcon.bind(this)}
              setFeedFilter={this.props.setFilter || false}
              setSearchRef={this.props.setSearchRef || false}
            />}

          <h1>{this.props.children}</h1>

          {this.props.light &&
            <span
              className="deploy"
              onClick={this.selectToDeploy.bind(this)}
              ref={deployIconRef}
            >
              <Deploy />
            </span>}
        </div>

        <section>
          <Done />
          <p>Context updated for now CLI!</p>
        </section>

        <style jsx>
          {`
            aside {
              height: 38px;
              display: flex;
              position: fixed;
              justify-content: center;
              align-items: center;
              top: 0;
              left: 0;
              right: 0;
              background: #fff;
              z-index: 5;
              user-select: none;
              cursor: default;
            }
            h1 {
              margin: 0;
              color: #9B9B9B;
              font-size: 12px;
              letter-spacing: 0.02em;
              font-weight: 400;
            }
            .light {
              height: 35px;
              border-bottom: 1px solid #D6D6D6;
              background: #fff;
              position: relative;
              overflow: hidden;
              border-top-left-radius: 5px;
              border-top-right-radius: 5px;
              flex-shrink: 0;
            }
            .light h1 {
              color: #000;
              font-size: 13px;
              font-weight: 600;
            }
            .light .deploy {
              position: absolute;
              height: 36px;
              width: 36px;
              right: 0;
              top: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              opacity: .5;
              transition: opacity .2s ease;
            }
            .light .deploy:hover {
              opacity: 1;
            }
            .light .deploy.hidden {
              opacity: 0;
            }
            .windows {
              border-radius: 0;
            }
            section {
              opacity: 0;
              transition: opacity .8s ease;
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              background: #fff;
              font-size: 12px;
              align-items: center;
              display: flex;
              padding-left: 17px;
              pointer-events: none;
            }
            section p {
              margin-left: 12px;
            }
            .scope-updated section {
              opacity: 1;
            }
            div {
              transition: opacity .5s ease;
            }
            .scope-updated div {
              opacity: 0;
            }
          `}
        </style>
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
