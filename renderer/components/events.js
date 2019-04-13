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
  clearScroll = () => {
    if (!this.scrollingSection) {
      return;
    }
    this.scrollingSection.scrollTop = 0;
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
import { useRef, useReducer, useEffect, Fragment } from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import makeUnique from 'make-unique';
import Loading from '../components/feed/loading';
import EventMessage from '../components/feed/event';
import eventsEffect from '../effects/events';

const loadingOlder = (loadingIndicator, events, active, darkMode) => {
  // If no active scope has been chosen yet,
  // there's no need for this component to show.
  if (!active) {
    return null;
  }

  // If there are no events in total, no events for this shope
  // or less than 30 events for this scope (which is the number of
  // events we're loading in one pull), we already know
  // that there is no need for loading more.
  if (!events || !events[active.id] || events[active.id].length < 30) {
    return null;
  }

  const haha = false;

  return (
    <aside ref={loadingIndicator} className={darkMode ? 'dark' : ''}>
      {haha ? (
        <span key="description">{`That's it. No events left to show!`}</span>
      ) : (
        <Fragment>
          <img key="animation" src="/static/loading.gif" />
          <span key="description">Loading Older Events...</span>
        </Fragment>
      )}
      <style jsx>{`
        aside {
          font-size: 12px;
          color: #666666;
          text-align: center;
          background: #f5f5f5;
          border-top: 1px solid #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 42px;
        }

        aside.dark {
          border-top-color: #1f1f1f;
          background: #333;
          color: #999;
        }

        img {
          height: 17px;
          margin-right: 8px;
        }
      `}</style>
    </aside>
  );
};

const renderEvents = (
  scopes,
  setActive,
  user,
  events,
  active,
  online,
  darkMode
) => {
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

  const setScopeWithSlug = slug => {
    const related = scopes.find(scope => scope.slug === slug);

    if (related) {
      setActive(related);
    }
  };

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
        setScopeWithSlug={setScopeWithSlug}
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

const Events = ({ online, darkMode, scopes, setActive, active, config }) => {
  const user = scopes && scopes.find(scope => scope.isCurrentUser);

  const scrollingSection = useRef(null);
  const loadingIndicator = useRef(null);
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
      {renderEvents(scopes, setActive, user, events, active, online, darkMode)}
      {loadingOlder(loadingIndicator, events, active, darkMode)}

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
  config: PropTypes.object,
  setActive: PropTypes.func
};

export default Events;
