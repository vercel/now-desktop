// Packages
import electron from 'electron'
import { Component } from 'react'

// Styles
import styles from '../styles/components/tips'

// Bulb
import Bulb from '../vectors/bulb'
import Clear from '../vectors/clear'

const tips = [
  {
    id: 'pasteFromClipboard',
    component: (
      <span>
        Use <kbd>⌘</kbd> + <kbd>V</kbd> to deploy files
        <style>{`
          kbd {
            font-family: Monaco, Lucida Console, Liberation Mono, serif;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            border: 1px solid #d5d5d5;
            font-size: 12px;
            margin: 5px 0;
            display: inline-block;
          }
        `}</style>
      </span>
    )
  }
]

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
    config.shownTips = config.shownTips || {}

    this.setState({
      tip: tips.find(({ id }) => !config.shownTips[id])
    })
  }

  closeTip = async () => {
    if (!this.remote) {
      return
    }

    const { saveConfig } = this.remote.require('./utils/config')
    await saveConfig(
      {
        shownTips: { [this.state.tip.id]: true }
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
          <section className="tip" key={this.state.tip.id}>
            <span className="icon">
              <Bulb />
            </span>
            <p>
              <b>Tip:</b> {this.state.tip.component}
            </p>
            <span className="icon clickable" onClick={this.closeTip}>
              <Clear color="#4e4e4e" />
            </span>
          </section>
        )}

        <style jsx>{styles}</style>
      </div>
    )
  }
}

export default Tips
