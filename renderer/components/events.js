/* A
import queryString from 'query-string';
import { Fragment, Component } from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import isEqual from 'react-fast-compare';
import setRef from 'react-refs';
import { renderToStaticMarkup } from 'react-dom/server';
import strip from ';
import parseHTML from 'html-to-react';
import retry from 'async-retry';
import makeUnique from 'make-unique';
import Title from '../components/title';
import Switcher from '../components/feed/switcher';
import DropZone from '../components/feed/dropzone';
import EventMessage from '../components/feed/event';
import NoEvents from '../components/feed/none';
import Loading from '../components/feed/loading';
import messageComponents from '../components/feed/messages';
import loadData from '../utils/data/load';
import { API_EVENTS, API_USER } from '../utils/data/endpoints';
import ipc from '../utils/ipc';
import {
  feedStyles,
  headingStyles,
  loaderStyles,
  pageStyles
} from '../styles/pages/feed';
class Feed extends Component {
  async cacheEvents(scope, until, track) {
    const { teams, scope: activeScope } = this.state;
    if (until) {
      track = true;
    }
    if (track) {
      this.loading.add(scope);
    }
    const relatedCache = teams.find(item => item.id === scope);
    const lastUpdate = relatedCache.lastUpdate;
    const isTeam = Boolean(relatedCache.slug);
    const loaders = new Set();
    const query = {
      types: this.eventTypes
    };
    if (until) {
      query.until = until;
    } else if (lastUpdate) {
      // Ensure that we only load events that were created
      // after the most recent one, so that we don't get the most
      // recent one included
      const startDate = Date.parse(lastUpdate) + 1;
      query.since = new Date(startDate).toISOString();
    }
    if (isTeam) {
      query.teamId = scope;
    }
    loaders.add(this.loadEvents(query));
    let results;
    try {
      results = await Promise.all(loaders);
    } catch (err) {
      if (track) {
        this.loading.delete(scope);
      }
      return;
    }
    const events = Object.assign({}, this.state.events);
    const relatedCacheIndex = teams.indexOf(relatedCache);
    for (const result of results) {
      const hasEvents = result && result.length > 0;
      if (!hasEvents && events[scope]) {
        if (until) {
          teams[relatedCacheIndex].allCached = true;
          this.setState({ teams }, () => {
            this.loading.delete(scope);
          });
        }
        // We had `return` here before, which was most
        // likely causing the event stream to get stuck if
        // there were no new ones in a certain group,
        // although the other groups might still have had new events.
        continue;
      }
      let newLastUpdate;
      if (hasEvents) {
        newLastUpdate = result[0].created;
      } else {
        newLastUpdate = new Date().toISOString();
      }
      teams[relatedCacheIndex].lastUpdate = newLastUpdate;
      const scopedEvents = events[scope];
      if (!scopedEvents) {
        events[scope] = {};
      }
      if (hasEvents && scopedEvents) {
        let merged;
        // When using infinite scrolling, we need to
        // add the events to the end, otherwise before
        if (until) {
          merged = scopedEvents.concat(result);
        } else {
          merged = result.concat(scopedEvents);
        }
        const unique = makeUnique(merged, (a, b) => a.id === b.id);
        const isCurrent = relatedCache.id === activeScope;
        const scrollPosition = this.scrollingSection.scrollTop;
        let shouldKeep;
        // Ensure that never more than 50 events are cached. But only
        // if infinite scrolling is not being used.
        if (until || (isCurrent && scrollPosition > 0)) {
          shouldKeep = true;
        }
        events[scope] = shouldKeep ? unique : unique.slice(0, 50);
      } else {
        events[scope] = result;
      }
    }
    this.setState(
      {
        events,
        teams
      },
      () => {
        if (track) {
          this.loading.delete(scope);
        }
      }
    );
  }
  clearScroll = () => {
    if (!this.scrollingSection) {
      return;
    }
    this.scrollingSection.scrollTop = 0;
  };
  setScope = scope => {
    this.clearScroll();
    // Update the scope
    this.setState({ scope }, () => {
      if (this.state.teams.length === 0) {
        return;
      }
      // And then pull events for it
      this.cacheEvents(scope);
    });
    // Hide search field when switching team scope
    if (this.searchField) {
      this.searchField.hide(true);
    }
  };
  scrolled = event => {
    if (!this.loadingIndicator) {
      return;
    }
    const { scope, events } = this.state;
    // Check if we're already pulling data
    if (this.loading.has(scope)) {
      return;
    }
    const section = event.target;
    const offset = section.offsetHeight + this.loadingIndicator.offsetHeight;
    const distance = section.scrollHeight - section.scrollTop;
    if (!events || !events[scope]) {
      return;
    }
    if (distance < offset + 300) {
      const scopedEvents = events[scope];
      const lastEvent = scopedEvents[scopedEvents.length - 1];
      retry(() => this.cacheEvents(scope, lastEvent.created), {
        retries: 5,
        factor: 2,
        maxTimeout: 5000
      });
    }
  };
  loadingOlder() {
    const { events: eventList, eventFilter, scope, darkMode } = this.state;
    if (eventFilter) {
      return;
    }
    const events = eventList[scope];
    if (!events || events.length < 30) {
      return;
    }
    const teams = this.state.teams;
    const relatedTeam = teams.find(item => item.id === scope);
    return (
      <aside
        ref={item => {
          this.loadingIndicator = item;
        }}
        className={darkMode ? 'dark' : ''}
      >
        {relatedTeam.allCached ? (
          <span key="description">{`That's it. No events left to show!`}</span>
        ) : (
          <Fragment>
            <img key="animation" src="/static/loading.gif" />
            <span key="description">Loading Older Events...</span>
          </Fragment>
        )}
        <style jsx>{loaderStyles}</style>
      </aside>
    );
  }
  render() {
    const activeScope = this.detectScope('id', this.state.scope);
    const isUser = this.isUser(activeScope);
    if (!this.state.hasLoaded) {
      return null;
    }
    return (
      <main>
        <div onDragEnter={this.showDropZone}>
          <Title
            setFilter={this.setFilter}
            setSearchRef={this.setReference}
            ref={this.setReference}
            name="title"
            searchShown={Boolean(activeScope)}
            isUser={isUser}
            darkBg={this.state.darkMode}
            config={this.state.config}
          >
            {activeScope ? activeScope.name : 'Now'}
          </Title>
          {this.state.dropZone && (
            <DropZone darkBg={this.state.darkMode} hide={this.hideDropZone} />
          )}
          <section
            className={this.state.darkMode ? 'dark' : ''}
            ref={this.setReference}
            onScroll={this.scrolled}
            name="scrollingSection"
          >
            {this.renderEvents(activeScope)}
            {this.loadingOlder()}
          </section>
          <Switcher
            setFeedScope={this.setScope}
            setTeams={this.setTeams}
            currentUser={this.state.currentUser}
            titleRef={this.title}
            online={this.state.online}
            activeScope={activeScope}
            darkBg={this.state.darkMode}
          />
        </div>
      </main>
    );
  }
}
export default Feed;
*/

import PropTypes from 'prop-types';
import { useRef, useReducer, useEffect } from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import makeUnique from 'make-unique';
import Loading from '../components/feed/loading';
import EventMessage from '../components/feed/event';
import eventsEffect from '../effects/events';

const renderEvents = (user, events, active, online, darkMode) => {
  if (!online) {
    return <Loading darkMode={darkMode} offline />;
  }

  if (!active) {
    return <Loading darkMode={darkMode} />;
  }

  const scopedEvents = events[active.id];

  if (!scopedEvents) {
    return <Loading darkMode={darkMode} />;
  }

  const months = {};

  for (const message of scopedEvents) {
    const created = parse(message.created);
    const month = format(created, 'MMMM YYYY');

    if (!months[month]) {
      months[month] = [];
    }

    months[month].push(message);
  }

  // We can't just use `month` as the ID for each heading,
  // because they would glitch around in that case (as
  // the month is the same across scopes)
  return Object.keys(months).map(month => [
    <h1 className={darkMode ? 'dark' : ''} key={active.id + month}>
      {month}
      <style jsx>{`
        h1 {
          background: #f5f5f5;
          font-size: 10px;
          height: 23px;
          line-height: 23px;
          padding: 0 10px;
          color: #000;
          margin: 0;
          position: sticky;
          top: 0;
          text-transform: uppercase;
          font-weight: 200;
          border-bottom: 1px solid #fff;
          border-top: 1px solid #fff;
        }

        h1.dark {
          background: #161616;
          color: #9c9c9c;
          border-bottom: 1px solid #000;
          border-top: 1px solid #000;
        }

        h1:first-child {
          border-top: 0;
        }
      `}</style>
    </h1>,
    months[month].map(event => (
      <EventMessage
        event={event}
        darkMode={darkMode}
        active={active}
        user={user}
        key={event.id}
      />
    ))
  ]);
};

const eventReducer = (state, action) => {
  const existing = state[action.scope] || [];
  let updated = null;

  switch (action.type) {
    case 'prepend':
      updated = action.events.concat(existing).slice(0, 50);
      break;
    case 'append':
      updated = existing.concat(action.events);
      break;
    default:
      throw new Error('Action type not allowed');
  }

  return Object.assign({}, state, {
    [action.scope]: makeUnique(updated, (a, b) => a.id === b.id)
  });
};

const Events = ({ online, darkMode, scopes, active, config }) => {
  const user = scopes && scopes.find(scope => scope.isCurrentUser);

  const scrollingSection = useRef(null);
  const [events, dispatchEvents] = useReducer(eventReducer, {});

  useEffect(
    () => {
      // Wait until the active scope and all scopes are defined.
      if (scopes === null || active === null) {
        return;
      }

      return eventsEffect(scopes, active, events, dispatchEvents, config);
    },

    // Only run again if scopes or config change.
    [
      config && config.lastUpdate,
      JSON.stringify(scopes),
      JSON.stringify(active)
    ]
  );

  return (
    <section
      className={darkMode ? 'dark' : ''}
      ref={scrollingSection}
      onScroll={() => {}}
    >
      {renderEvents(user, events, active, online, darkMode)}
      <style jsx>{`
        section {
          overflow-y: auto;
          overflow-x: hidden;
          background: #fff;
          user-select: none;
          cursor: default;
          flex-shrink: 1;
          position: relative;
        }

        section.dark {
          background: #1f1f1f;
        }

        /*
          This is required because the element always needs
          to be at least as high as the remaining space, flex
          will shrink it down then
        */

        section {
          height: 100vh;
        }
      `}</style>
    </section>
  );
};

Events.propTypes = {
  online: PropTypes.bool,
  darkMode: PropTypes.bool,
  scopes: PropTypes.array,
  active: PropTypes.object,
  config: PropTypes.object
};

export default Events;
