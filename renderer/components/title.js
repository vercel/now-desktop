// Packages
import React from 'react'
import PropTypes from 'prop-types'

// Utilities
import remote from '../utils/electron'

// Components
import Deploy from '../vectors/deploy'
import Search from './search'

class Title extends React.Component {
  componentDidMount() {
    this.dialogs = remote.require('./dialogs')
  }

  selectToDeploy() {
    this.dialogs.deploy()
  }

  toggleDeployIcon() {
    this.deployIcon.classList.toggle('hidden')
  }

  render() {
    const deployIconRef = icon => {
      this.deployIcon = icon
    }

    return (
      <aside className={this.props.light && 'light'}>
        {this.props.light &&
          <Search toggleDeployIcon={this.toggleDeployIcon.bind(this)} />}

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
            height: 37px;
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
            border-bottom: 1px solid #D6D6D6;
            background: #fff;
            position: relative;
            overflow: hidden;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }

          .light h1 {
            color: #000;
            font-size: 14px;
          }

          .light .deploy {
            position: absolute;
            height: 37px;
            width: 42px;
            right: 0;
            top: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
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
  light: React.PropTypes.bool
}

export default Title
