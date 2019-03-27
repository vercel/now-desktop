import { PureComponent } from 'react'
import { func, bool } from 'prop-types'
import setRef from 'react-refs'
import MagnifyingGlass from '../../vectors/search'
import Clear from '../../vectors/clear'
import styles from '../../styles/components/feed/search'

class Search extends PureComponent {
  state = {
    shown: false
  }

  setReference = setRef.bind(this)

  show = () => {
    this.props.showDeployIcon()

    setTimeout(() => {
      this.input.focus()
    }, 200)

    this.form.style.visibility = 'visible'

    this.setState({
      shown: true
    })
  }

  hide = deployIcon => {
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

  typed = event => {
    if (event.keyCode && event.keyCode === 27) {
      this.hide(true)
      return
    }

    const value = event.target.value || null

    if (this.props.setFeedFilter) {
      this.props.setFeedFilter(value)
    }
  }

  handleKeyDown = event => {
    if (!event) {
      return
    }

    if (event.keyCode === 70 && event.metaKey) {
      this.show()
    }
  }

  showWindow = () => {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  hideWindow = () => {
    this.hide(true)

    document.removeEventListener('keydown', this.handleKeyDown)
  }

  selectAll(event) {
    if (!event) {
      return
    }

    if (event.keyCode === 65 && event.metaKey) {
      event.target.select()
    }
  }

  render() {
    const classes = []

    if (this.props.darkBg) {
      classes.push('dark')
    }

    if (this.state.shown) {
      classes.push('visible')
    }

    return (
      <aside className={classes.join(' ')}>
        <span onClick={this.show}>
          <MagnifyingGlass darkBg={this.props.darkBg} />
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
            <Clear color={this.props.darkBg ? '#999' : '#4e4e4e'} />
          </b>
        </div>

        <style jsx>{styles}</style>
      </aside>
    )
  }
}

Search.propTypes = {
  showDeployIcon: func.isRequired,
  hideDeployIcon: func.isRequired,
  setFeedFilter: func,
  setSearchRef: func,
  darkBg: bool
}

export default Search
