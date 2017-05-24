// Packages
import electron from 'electron'
import React from 'react'
import PropTypes from 'prop-types'

// Components
import Deploy from '../vectors/deploy'
import Search from './feed/search'

class Title extends React.Component {
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

  render() {
    const deployIconRef = icon => {
      this.deployIcon = icon
    }

    return (
      <aside className={this.props.light && 'light'}>
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
            background: #000;
            z-index: 5;
            user-select: none;
            cursor: default;
          }

          h1 {
            margin: 0;
            color: #9B9B9B;
            font-size: 12px;
            letter-spacing: 0.02em;
            font-weight: 400
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
