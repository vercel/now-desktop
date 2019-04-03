import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import setRef from 'react-refs';
import styles from '../styles/components/title';
import Done from '../vectors/done';
import Deploy from '../vectors/deploy';
import Filter from '../vectors/filter';
import Search from './feed/search';
import Tips from './tips';

class Title extends PureComponent {
  state = {
    updateMessage: false,
    typeFilter: false,
    filteredType: 'team'
  };

  setReference = setRef.bind(this);

  selectToDeploy = () => {
    this.dialogs.deploy();
  };

  hideDeployIcon = () => {
    this.deployIcon.classList.add('hidden');
  };

  showDeployIcon = () => {
    this.deployIcon.classList.remove('hidden');
  };

  toggleFilter = () => {
    this.setState({
      typeFilter: !this.state.typeFilter
    });
  };

  scopeUpdated() {
    if (this.state.updateMessage) {
      return;
    }

    this.setState({
      updateMessage: true
    });

    setTimeout(() => {
      this.setState({
        updateMessage: false
      });
    }, 1000);
  }

  updateTypeFilter(type) {
    if (type === this.state.filteredType) {
      return;
    }

    const { setTypeFilter } = this.props;

    if (setTypeFilter) {
      setTypeFilter(type);
    }

    this.setState({ filteredType: type });
  }

  renderTypeFilter() {
    const { isUser } = this.props;
    const types = isUser ? [] : ['Me', 'Team'];
    const { filteredType } = this.state;

    return (
      <section className="filter">
        <nav>
          {types.map((item, index) => {
            const classes = [];
            const handle = item.toLowerCase();

            if (filteredType === handle) {
              classes.push('active');
            }

            if (isUser && filteredType === 'team' && index === 0) {
              classes.push('active');
            }

            return (
              <a
                className={classes.join(' ')}
                key={item}
                onClick={this.updateTypeFilter.bind(this, handle)}
              >
                {item}
              </a>
            );
          })}
        </nav>

        <style jsx>{styles}</style>
      </section>
    );
  }

  render() {
    const classes = [];
    const { darkBg, light, isUser, searchShown, showTips } = this.props;

    if (darkBg) {
      classes.push('dark');
    }

    if (light) {
      classes.push('light');
    }

    if (process.platform === 'win32') {
      classes.push('windows');
    }

    if (this.state.updateMessage) {
      classes.push('scope-updated');
    }

    if (this.state.typeFilter) {
      classes.push('filter-visible');
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
                darkBg={darkBg}
              />
            )}

          <h1>{this.props.children}</h1>

          {light &&
            searchShown &&
            !isUser && (
              <span className="toggle-filter" onClick={this.toggleFilter}>
                <Filter darkBg={darkBg} />
              </span>
            )}

          {light && (
            <span
              className="deploy"
              onClick={this.selectToDeploy}
              ref={this.setReference}
              name="deployIcon"
            >
              <Deploy darkBg={darkBg} />
            </span>
          )}
        </div>

        <section className="update-message">
          <Done />
          <p>Context updated for Now CLI!</p>
        </section>

        {showTips && <Tips darkBg={darkBg} />}

        {this.renderTypeFilter()}

        <style jsx>{styles}</style>
      </aside>
    );
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
};

Title.defaultProps = {
  showTips: true
};

export default Title;
