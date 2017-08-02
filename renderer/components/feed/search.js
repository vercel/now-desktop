// Packages
import electron from 'electron'
import React from 'react'
import { func } from 'prop-types'
import setRef from 'react-refs'

// Vectors
import MagnifyingGlass from '../../vectors/search'
import Clear from '../../vectors/clear'

// Styles
import styles from '../../styles/components/feed/search'

class Search extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = { shown: false }
    this.setReference = setRef.bind(this)

    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
    this.typed = this.typed.bind(this)
  }

  show() {
    this.props.showDeployIcon()

    setTimeout(() => {
      this.input.focus()
    }, 200)

    this.form.style.visibility = 'visible'

    this.setState({
      shown: true
    })
  }

  hide(deployIcon) {
    if (!this.form || !this.input) {
      return
    }

    this.setState({
      shown: false
    })

    // Reset feed filter to show all events again
    if (this.props.setFeedFilter) {
      this.props.setFeedFilter(null)
    }

    if (!deployIcon) {
      setTimeout(() => {
        this.props.hideDeployIcon()
      }, 100)
    }

    setTimeout(() => {
      // We need to check here again because
      // the element changes over time
      if (!this.form || !this.input) {
        return
      }

      this.form.style.visibility = 'hidden'

      this.input.value = ''
      this.input.blur()
    }, 200)
  }

  typed(event) {
    if (event.keyCode && event.keyCode === 27) {
      this.hide(true)
      return
    }

    const value = event.target.value || null

    if (this.props.setFeedFilter) {
      this.props.setFeedFilter(value)
    }
  }

  handleKeyDown(event) {
    if (!event) {
      return
    }

    if (event.keyCode === 70 && event.metaKey) {
      this.show()
    }
  }

  selectAll(event) {
    if (!event) {
      return
    }

    if (event.keyCode === 65 && event.metaKey) {
      event.target.select()
    }
  }

  componentDidMount() {
    const remote = electron.remote || false

    if (!remote) {
      return
    }

    const currentWindow = remote.getCurrentWindow()

    // Clear search when window gets hidden
    currentWindow.on('hide', () => this.hide(true))

    // Allow feed to close the search when switching
    // the team scope
    if (this.props.setSearchRef) {
      this.props.setSearchRef(this, 'searchField')
    }

    currentWindow.on('show', () => {
      document.addEventListener('keydown', this.handleKeyDown.bind(this))
    })

    currentWindow.on('hide', () => {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    })
  }

  render() {
    return (
      <aside className={this.state.shown ? 'visible' : ''}>
        <span onClick={this.show}>
          <MagnifyingGlass />
        </span>

        <div ref={this.setReference} name="form">
          <input
            type="text"
            ref={this.setReference}
            placeholder="Search the Timeline..."
            onKeyUp={this.typed}
            onKeyDown={this.selectAll}
            name="input"
          />

          <b onClick={this.hide}>
            <Clear color="#4e4e4e" />
          </b>
        </div>

        <style jsx>
          {styles}
        </style>
      </aside>
    )
  }
}

Search.propTypes = {
  showDeployIcon: func.isRequired,
  hideDeployIcon: func.isRequired,
  setFeedFilter: func,
  setSearchRef: func
}

export default Search
