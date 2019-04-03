import { Component } from 'react';
import { func, object, bool } from 'prop-types';
import isEqual from 'react-fast-compare';
import setRef from 'react-refs';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import makeUnique from 'make-unique';
import {
  wrapStyle,
  listStyle,
  itemStyle,
  helperStyle
} from '../../styles/components/feed/switcher';
import loadData from '../../utils/data/load';
import { API_TEAMS } from '../../utils/data/endpoints';
import Clear from '../../vectors/clear';
import { getConfig, saveConfig } from '../../utils/ipc';
import Avatar from './avatar';
import CreateTeam from './create-team';

class Switcher extends Component {
  state = {
    teams: [],
    scope: null,
    updateFailed: false,
    initialized: false,
    syncInterval: '5s',
    queue: []
  };

  setReference = setRef.bind(this);

  // Don't update state when dragging teams
  moving = false;

  // Ensure that config doesn't get checked when the
  // file is updated from this component
  savingConfig = false;

  showWindow = () => {
    if (this.timer && this.state.syncInterval !== '5s') {
      clearInterval(this.timer);

      // Refresh the teams and events when the window gets
      // shown, so that they're always up-to-date
      this.loadTeams();

      // Restart the timer so we keep everything in sync every 5s
      this.listTimer();
      this.setState({ syncInterval: '5s' });
    }

    document.addEventListener('keydown', this.keyDown.bind(this));
  };

  componentDidMount() {
    this.loadTeams();
  }

  hideWindow = () => {
    if (this.timer && this.state.syncInterval !== '5m') {
      clearInterval(this.timer);

      // Restart the timer so we keep everything in sync every 5m
      this.listTimer();
      this.setState({ syncInterval: '5m' });
    }

    document.removeEventListener('keydown', this.keyDown.bind(this));
  };

  componentWillReceiveProps({ currentUser, activeScope }) {
    if (activeScope) {
      this.changeScope(activeScope, true, true, true);
      return;
    }

    if (!currentUser) {
      return;
    }

    if (this.state.scope !== null) {
      return;
    }

    this.setState({
      scope: currentUser.uid
    });
  }

  componentWillMount() {
    // Support SSR
  }

  listTimer = () => {
    // Test
  };

  async applyTeamOrder(list, order) {
    const newList = [];

    if (!order) {
      return list;
    }

    for (const position of order) {
      const index = order.indexOf(position);

      newList[index] = list.find(item => {
        const name = item.slug || item.name;
        return name === position;
      });
    }

    // Apply the new data at the end, but keep order
    return this.merge(newList, list);
  }

  merge(first, second) {
    const merged = first.concat(second);
    return makeUnique(merged, (a, b) => a.id === b.id);
  }

  async getTeamOrder() {
    let config;

    try {
      config = await getConfig();
    } catch (err) {}

    if (!config || !config.desktop || !config.desktop.teamOrder) {
      return false;
    }

    const order = config.desktop.teamOrder;

    if (!Array.isArray(order) || order.length === 0) {
      return false;
    }

    return order;
  }

  async haveUpdated(data) {
    const newData = JSON.parse(JSON.stringify(data));
    let currentData = JSON.parse(JSON.stringify(this.state.teams));

    if (currentData.length > 0) {
      // Remove teams that the user has left
      currentData = currentData.filter(team => {
        return Boolean(newData.find(item => item.id === team.id));
      });
    }

    const ordered = this.merge(currentData, newData);
    const copy = JSON.parse(JSON.stringify(ordered));
    const order = await this.getTeamOrder();

    if (!order) {
      return ordered;
    }

    for (const item of order) {
      const isPart = newData.find(team => {
        return team.name === item || team.slug === item;
      });

      // If the saved team order contains a team that
      // the user is not a part of, we can ignore it.
      if (!isPart) {
        return ordered;
      }
    }

    if (isEqual(ordered, currentData)) {
      return false;
    }

    // Then order the teams as saved in the config
    return this.applyTeamOrder(copy, order);
  }

  async loadTeams(firstLoad) {
    const data = await loadData(API_TEAMS);

    if (!data || !data.teams || !this.props.currentUser) {
      return;
    }

    const teams = data.teams;
    const user = this.props.currentUser;

    teams.unshift({
      id: user.uid,
      name: user.username
    });

    const updated = await this.haveUpdated(teams);

    const scopeExists = updated.find(team => {
      return this.state.scope === team.id;
    });

    if (!scopeExists) {
      this.resetScope();
    }

    if (updated) {
      this.setState({ teams: updated });
    }

    if (this.props.setTeams) {
      // When passing `null`, the feed will only
      // update the events, not the teams
      await this.props.setTeams(updated || null, firstLoad);
    }
  }

  resetScope() {
    const currentUser = this.props.currentUser;

    if (!currentUser) {
      return;
    }

    this.changeScope({
      id: currentUser.uid
    });
  }

  keyDown(event) {
    const activeItem = document.activeElement;

    if (activeItem && activeItem.tagName === 'INPUT') {
      return;
    }

    const code = event.code;
    const number = code.includes('Digit') ? code.split('Digit')[1] : false;

    if (number && number <= 9 && this.state.teams.length > 1) {
      if (this.state.teams[number - 1]) {
        event.preventDefault();

        const relatedTeam = this.state.teams[number - 1];
        this.changeScope(relatedTeam);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { teams, scope } = this.state;

    const teamsChanged = !isEqual(teams, prevState.teams);
    const scopeChanged = !isEqual(scope, prevState.scope);

    if (teamsChanged || scopeChanged) {
      // Update touch bar here
    }

    while (this.state.queue.length > 0) {
      const queue = this.state.queue;

      queue.shift()();

      this.setState({ queue });
    }

    if (this.state.initialized) {
      return;
    }

    const teamsCount = teams.length;

    if (teamsCount === 0) {
      return;
    }

    const when = 100 + 100 * teamsCount + 600;

    setTimeout(() => {
      // Ensure that the animations for the teams
      // fading in works after recovering from offline mode
      if (!this.props.online) {
        return;
      }

      this.setState({
        initialized: true
      });
    }, when);
  }

  static getDerivedStateFromProps(props) {
    // Ensure that the animations for the teams
    // fading in works after recovering from offline mode.
    if (!props.online) {
      return {
        initialized: false
      };
    }

    return null;
  }

  async updateConfig(team, updateMessage) {
    const currentUser = this.props.currentUser;

    if (!currentUser) {
      return;
    }

    const info = {
      currentTeam: null
    };

    // Only add fresh data to config if new scope is team, not user
    // Otherwise just clear it
    if (currentUser.uid !== team.id) {
      // Only save the data we need, not the entire object
      info.currentTeam = {
        id: team.id,
        slug: team.slug,
        name: team.name
      };
    }

    // And then update the config file
    await this.saveConfig(info);

    // Show a notification that the context was updated
    // in the title bar
    if (updateMessage && this.props.titleRef) {
      this.props.titleRef.scopeUpdated();
    }
  }

  changeScope(team, saveToConfig, byHand, noFeed) {
    // If the clicked item in the team switcher is
    // already the active one, don't do anything
    if (this.state.scope === team.id) {
      return;
    }

    if (!noFeed && this.props.setFeedScope) {
      // Load different messages into the feed
      this.props.setFeedScope(team.id);
    }

    // Make the team/user icon look active by
    // syncing the scope with the feed
    this.setState({ scope: team.id });

    // Save the new `currentTeam` to the config
    if (saveToConfig) {
      const queueFunction = (fn, context, params) => {
        return () => {
          fn.apply(context, params);
        };
      };

      this.setState({
        queue: this.state.queue.concat([
          queueFunction(this.updateConfig, this, [team, byHand])
        ])
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // There are two cases in which we do not want to re-render:
    //
    // - Someone is dragging something around in the UI (this.moving)
    // - The state and/or props didn't change (rest of the statement)
    //
    // It is extremely important to understand that `shouldComponentUpdate` will
    // be called even if the state AND props did not change. Because that is exactly
    // the purpose of this function: To decide whether something changed.
    if (
      this.moving ||
      (isEqual(this.state, nextState) && isEqual(this.props, nextProps))
    ) {
      return false;
    }

    return true;
  }

  openMenu = () => {
    // The menu toggler element has children
    // we have the ability to prevent the event from
    // bubbling up from those, but we need to
    // use `this.menu` to make sure the menu always gets
    // bounds to the parent
    const { bottom, left, height, width } = this.menu.getBoundingClientRect();

    window.ipc.send('open-menu-request', {
      x: left,
      y: bottom,
      height,
      width
    });
  };

  saveTeamOrder(teams) {
    const teamOrder = [];

    for (const team of teams) {
      teamOrder.push(team.slug || team.name);
    }

    this.saveConfig({
      desktop: { teamOrder }
    });
  }

  async saveConfig(newConfig) {
    // Ensure that we're not handling the
    // event triggered by changes made to the config
    // because the changes were triggered manually
    // inside this app
    this.savingConfig = true;

    // Then update the config file
    await saveConfig(newConfig, 'config');
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    document.body.classList.toggle('is-moving');

    // Allow the state to update again
    this.moving = false;

    // Don't update if it was dropped at the same position
    if (oldIndex === newIndex) {
      return;
    }

    const teams = arrayMove(this.state.teams, oldIndex, newIndex);
    this.saveTeamOrder(teams);

    // Ensure that we're not dealing with the same
    // objects or array ever again
    this.setState({
      teams: JSON.parse(JSON.stringify(teams))
    });
  };

  onSortStart = () => {
    document.body.classList.toggle('is-moving');

    // Prevent the state from being updated
    this.moving = true;
  };

  scrollToEnd = event => {
    event.preventDefault();

    if (!this.list) {
      return;
    }

    const list = this.list;
    list.scrollLeft = list.offsetWidth;
  };

  renderItem() {
    // eslint-disable-next-line new-cap
    return SortableElement(({ team }) => {
      const isActive = this.state.scope === team.id;
      const isUser = team.id && !team.id.includes('team');
      const index = this.state.teams.indexOf(team);
      const shouldScale = !this.state.initialized;
      const darkBg = this.props.darkBg;

      const classes = [];

      if (isActive) {
        classes.push('active');
      }

      if (darkBg) {
        classes.push('dark');
      }

      const clicked = event => {
        event.preventDefault();
        this.changeScope(team, true, true);
      };

      return (
        <li onClick={clicked} className={classes.join(' ')} key={team.id}>
          <Avatar
            team={team}
            isUser={isUser}
            scale={shouldScale}
            delay={index}
            hash={team.avatar}
          />

          <style jsx>{itemStyle}</style>
        </li>
      );
    });
  }

  renderTeams() {
    const Item = this.renderItem();

    return this.state.teams.map((team, index) => (
      <Item key={team.id} index={index} team={team} />
    ));
  }

  renderList() {
    const teams = this.renderTeams();

    // eslint-disable-next-line new-cap
    return SortableContainer(() => (
      <ul>
        {teams}
        <style jsx>{listStyle}</style>
      </ul>
    ));
  }

  allowDrag = event => {
    if (process.platform === 'win32') {
      return !event.ctrlKey;
    }

    return !event.metaKey;
  };

  retryUpdate = () => {};

  closeUpdateMessage = () => {
    this.setState({
      updateFailed: false
    });
  };

  render() {
    const List = this.renderList();
    const { updateFailed, teams } = this.state;
    const delay = teams.length;
    const { darkBg, online } = this.props;

    return (
      <div>
        {updateFailed && (
          <span className="update-failed">
            <p>
              The app failed to update! &mdash;{' '}
              <a onClick={this.retryUpdate}>Retry?</a>
            </p>
            <Clear onClick={this.closeUpdateMessage} color="#fff" />
          </span>
        )}
        <aside className={darkBg ? 'dark' : ''}>
          {online ? (
            <div className="list-container" ref={this.setReference} name="list">
              <div className="list-scroll">
                <List
                  axis="x"
                  lockAxis="x"
                  shouldCancelStart={this.allowDrag}
                  onSortEnd={this.onSortEnd}
                  onSortStart={this.onSortStart}
                  helperClass="switcher-helper"
                  lockToContainerEdges={true}
                  lockOffset="0%"
                />
                <CreateTeam delay={delay} darkBg={darkBg} />
              </div>

              <span className="shadow" onClick={this.scrollToEnd} />
            </div>
          ) : (
            <p className="offline">{'You are offline'}</p>
          )}

          <a
            className="toggle-menu"
            onClick={this.openMenu}
            onContextMenu={this.openMenu}
            ref={this.setReference}
            name="menu"
          >
            <i />
            <i />
            <i />
          </a>
        </aside>

        <style jsx>{wrapStyle}</style>

        <style jsx global>
          {helperStyle}
        </style>
      </div>
    );
  }
}

Switcher.propTypes = {
  setFeedScope: func,
  currentUser: object,
  setTeams: func,
  titleRef: object,
  activeScope: object,
  darkBg: bool,
  online: bool
};

export default Switcher;
