// Packages
import electron from 'electron'
import { Component } from 'react'
import { bool } from 'prop-types'

// Styles
import styles from '../styles/components/tips'

// Bulb
import Bulb from '../vectors/bulb'
import Clear from '../vectors/clear'

const tips = []

if (process.platform === 'darwin') {
  tips.push({
    id: 'pasteFromClipboard',
    component: (
      <span>
        Use <kbd>⌘</kbd> + <kbd>V</kbd> to deploy files
        <style>{`
          kbd {
            font-family: Monaco, Lucida Console, Liberation Mono, serif;
            padding: 1px 4px 0 4px;
            border-radius: 3px;
            background-color: rgba(0, 0, 0, 0.10);
            font-size: 10px;
            margin: 5px 0;
            display: inline-block;
          }
        `}</style>
      </span>
    )
  })
}

class Tips extends Component {
  state = {
    tip: null
  }
  remote = electron.remote || false

  async componentDidMount() {
    if (!this.remote) {
      return
    }

    const { getConfig } = this.remote.require('./utils/config')
    const config = await getConfig()
    const shownTips = (config.desktop && config.desktop.shownTips) || {}

    this.setState({
      tip: tips.find(({ id }) => !shownTips[id])
    })
  }

  closeTip = async () => {
    if (!this.remote) {
      return
    }

    const { saveConfig } = this.remote.require('./utils/config')
    await saveConfig(
      {
        desktop: {
          shownTips: { [this.state.tip.id]: true }
        }
      },
      'config'
    )
    this.setState({
      tip: null
    })
  }

  render() {
    return (
      <div>
        {this.state.tip && (
          <section className={`tip${this.props.darkBg ? ' dark' : ''}`} key={this.state.tip.id}>
            <span className="icon">
              <Bulb />
            </span>
            <p>
              <b>Tip:</b> {this.state.tip.component}
            </p>
            <span className="icon clickable close" onClick={this.closeTip}>
              <Clear color={this.props.darkBg ? '#999' : '#4e4e4e'} />
            </span>
          </section>
        )}

        <style jsx>{styles}</style>
      </div>
    )
  }
}

Tips.propTypes = {
  darkBg: bool
}

export default Tips
