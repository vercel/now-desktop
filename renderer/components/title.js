import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import setRef from 'react-refs';
import styles from '../styles/components/title';
import Done from '../vectors/done';
import Deploy from '../vectors/deploy';
import Search from './feed/search';
import Tips from './tips';

class Title extends PureComponent {
  state = {
    updateMessage: false
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

  render() {
    const classes = [];
    const { darkBg, config } = this.props;

    if (darkBg) {
      classes.push('dark');
    }

    if (process.platform === 'win32') {
      classes.push('windows');
    }

    if (this.state.updateMessage) {
      classes.push('scope-updated');
    }

    return (
      <aside className={classes.join(' ')}>
        <div>
          {this.props.searchShown && (
            <Search
              hideDeployIcon={this.hideDeployIcon}
              showDeployIcon={this.showDeployIcon}
              setFeedFilter={this.props.setFilter || false}
              setSearchRef={this.props.setSearchRef || false}
              darkBg={darkBg}
            />
          )}

          <h1>{this.props.children}</h1>

          <span
            className="deploy"
            onClick={this.selectToDeploy}
            ref={this.setReference}
            name="deployIcon"
          >
            <Deploy darkBg={darkBg} />
          </span>
        </div>

        <section className="update-message">
          <Done />
          <p>Context updated for Now CLI!</p>
        </section>

        <Tips darkBg={darkBg} config={config} />

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
  darkBg: PropTypes.bool,
  setFilter: PropTypes.func,
  setSearchRef: PropTypes.func,
  searchShown: PropTypes.bool,
  isUser: PropTypes.bool,
  config: PropTypes.object
};

export default Title;
