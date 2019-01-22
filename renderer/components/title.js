// Packages
import electron from 'electron'
import { Component } from 'react'
import PropTypes from 'prop-types'
import setRef from 'react-refs'

// Styles
import styles from '../styles/components/title'

// Components
import Done from '../vectors/done'
import Deploy from '../vectors/deploy'
import Filter from '../vectors/filter'
import Search from './feed/search'
import Tips from './tips'

class Title extends Component {
  constructor(...args) {
    super(...args)
    this.toggleSearch = this.toggleSearch.bind(this)
  }

  state = {
    updateMessage: false,
    typeFilter: false,
    filteredType: 'team',
    isSearchVisible: false
  }

  setReference = setRef.bind(this)

  componentDidMount() {
    const remote = electron.remote || false

    if (!remote) {
      return
    }

    this.dialogs = remote.require('./dialogs')
  }

  selectToDeploy = () => {
    this.dialogs.deploy()
  }

  hideDeployIcon = () => {
    this.deployIcon.classList.add('hidden')
  }

  showDeployIcon = () => {
    this.deployIcon.classList.remove('hidden')
  }

  toggleFilter = () => {
    this.setState({
      typeFilter: !this.state.typeFilter
    })
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
    }, 1000)
  }

  updateTypeFilter(type) {
    if (type === this.state.filteredType) {
      return
    }

    const { setTypeFilter } = this.props

    if (setTypeFilter) {
      setTypeFilter(type)
    }

    this.setState({ filteredType: type })
  }

  toggleSearch(next = null) {
    this.setState(state => {
      state.isSearchVisible =
        typeof next === 'boolean' ? next : !state.isSearchVisible

      return state
    })
  }

  renderTypeFilter() {
    const types = ['Me', 'Team', 'System']
    const { isUser } = this.props
    const { filteredType } = this.state

    if (isUser) {
      types.splice(1, 1)
    }

    return (
      <section className="filter">
        <nav>
          {types.map((item, index) => {
            const classes = []
            const handle = item.toLowerCase()

            if (filteredType === handle) {
              classes.push('active')
            }

            if (isUser && filteredType === 'team' && index === 0) {
              classes.push('active')
            }

            return (
              <a
                className={classes.join(' ')}
                key={item}
                onClick={this.updateTypeFilter.bind(this, handle)}
              >
                {item}
              </a>
            )
          })}
        </nav>

        <style jsx>{styles}</style>
      </section>
    )
  }

  render() {
    const classes = []

    if (this.props.darkBg) {
      classes.push('dark')
    }

    if (this.props.light) {
      classes.push('light')
    }

    if (process.platform === 'win32') {
      classes.push('windows')
    }

    if (this.state.updateMessage) {
      classes.push('scope-updated')
    }

    if (this.state.typeFilter) {
      classes.push('filter-visible')
    }

    return (
      <aside className={classes.join(' ')}>
        <div>
          {this.props.light &&
            this.props.searchShown && (
              <Search
                hideDeployIcon={this.hideDeployIcon}
                showDeployIcon={this.showDeployIcon}
                setFeedFilter={this.props.setFilter || false}
                setSearchRef={this.props.setSearchRef || false}
                darkBg={this.props.darkBg}
                toggleSearch={this.toggleSearch}
              />
            )}

          {this.state.isSearchVisible === false && (
            <h1>{this.props.children}</h1>
          )}

          {this.props.light &&
            this.props.searchShown &&
            this.state.isSearchVisible === false && (
              <span className="toggle-filter" onClick={this.toggleFilter}>
                <Filter darkBg={this.props.darkBg} />
              </span>
            )}

          {this.props.light &&
            this.state.isSearchVisible === false && (
              <span
                className="deploy"
                onClick={this.selectToDeploy}
                ref={this.setReference}
                name="deployIcon"
              >
                <Deploy darkBg={this.props.darkBg} />
              </span>
            )}
        </div>

        <section className="update-message">
          <Done />
          <p>Context updated for Now CLI!</p>
        </section>

        {this.props.showTips && <Tips darkBg={this.props.darkBg} />}

        {this.renderTypeFilter()}

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
  darkBg: PropTypes.bool,
  setFilter: PropTypes.func,
  setSearchRef: PropTypes.func,
  searchShown: PropTypes.bool,
  setTypeFilter: PropTypes.func,
  isUser: PropTypes.bool,
  showTips: PropTypes.bool
}

Title.defaultProps = {
  showTips: true
}

export default Title
