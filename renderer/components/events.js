import PropTypes from 'prop-types';
import { useRef, useReducer, useEffect, Fragment } from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import makeUnique from 'make-unique';
import eventsEffect from '../effects/events';
import scrollClearEffect from '../effects/clear-scroll';
import ipc from '../utils/ipc';
import Loading from './loading';
import Event from './event';

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

  const last = events[active.id][events[active.id].length - 1];
  const isEnd = last && last.id === 'end';

  return (
    <aside ref={loadingIndicator} className={darkMode ? 'dark' : ''}>
      {isEnd ? (
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
          display: flex;
          justify-content: center;
          align-items: center;
          height: 42px;
        }

        aside.dark {
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
  setConfig,
  config,
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
    // This is a placeholder that we are adding to
    // the end to know that we reached the end.
    if (message.id === 'end') {
      continue;
    }

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
      ipc
        .saveConfig(
          {
            currentTeam: related.isCurrentUser ? null : related.id
          },
          'config'
        )
        .then(newConfig => {
          const freshConfig = Object.assign({}, newConfig, {
            token: config.token
          });

          setConfig(freshConfig);
        })
        .catch(error => {
          console.error(`Failed to update config: ${error}`);
        });
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
          background: #e1e1e1;
          font-size: 10px;
          height: 23px;
          line-height: 23px;
          padding: 0 10px;
          color: #666;
          margin: 0;
          position: sticky;
          top: 0;
          text-transform: uppercase;
          font-weight: 200;
        }

        h1.dark {
          background: #2e2e2e;
          color: #999999;
        }
      `}</style>
    </h1>,
    months[month].map(event => (
      <Event
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

const scrolled = (
  setLoading,
  scopes,
  events,
  dispatchEvents,
  config,
  loading,
  active,
  loadingIndicator,
  scrollingSection
) => {
  if (!loadingIndicator || !loadingIndicator.current) {
    return;
  }

  if (!scrollingSection || !scrollingSection.current) {
    return;
  }

  // If there are already events being loaded for the
  // currently active scope, we do not want to trigger
  // loading even more now.
  if (loading.has(active.id)) {
    return;
  }

  const last = events[active.id][events[active.id].length - 1];
  const isEnd = last && last.id === 'end';

  // We have reached the end, so stop pulling more.
  if (isEnd) {
    return;
  }

  const section = scrollingSection.current;
  const indicator = loadingIndicator.current;
  const offset = section.offsetHeight + indicator.offsetHeight;
  const distance = section.scrollHeight - section.scrollTop;

  if (distance < offset + 300) {
    eventsEffect(
      setLoading,
      scopes,
      active,
      events,
      dispatchEvents,
      config,
      'append'
    );
  }
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

const loadingReducer = (state, action) => {
  const existing = new Set(state);

  switch (action.type) {
    case 'add':
      existing.add(action.scope);
      break;
    case 'remove':
      existing.delete(action.scope);
      break;
    default:
      throw new Error('Action type not allowed');
  }

  return existing;
};

const Events = ({ online, darkMode, scopes, setConfig, active, config }) => {
  const user = scopes && scopes.find(scope => scope.isCurrentUser);

  const scrollingSection = useRef(null);
  const loadingIndicator = useRef(null);

  const [events, dispatchEvents] = useReducer(eventReducer, {});
  const [loading, setLoading] = useReducer(loadingReducer, new Set());

  useEffect(
    () => {
      // Wait until the active scope and all scopes are defined.
      if (scopes === null || active === null) {
        return;
      }

      return eventsEffect(
        setLoading,
        scopes,
        active,
        events,
        dispatchEvents,
        config,
        'prepend'
      );
    },

    // Only run again if scopes or config change.
    [
      config && config.lastUpdate,
      JSON.stringify(scopes),
      JSON.stringify(active)
    ]
  );

  useEffect(
    () => {
      return scrollClearEffect(scrollingSection);
    },

    // Trigger again if the active scope changes.
    [JSON.stringify(active)]
  );

  return (
    <section
      className={darkMode ? 'dark' : ''}
      ref={scrollingSection}
      onScroll={() => {
        // Wait until the active scope and all scopes are defined.
        if (scopes === null || active === null) {
          return;
        }

        scrolled(
          setLoading,
          scopes,
          events,
          dispatchEvents,
          config,
          loading,
          active,
          loadingIndicator,
          scrollingSection
        );
      }}
    >
      {renderEvents(
        scopes,
        setConfig,
        config,
        user,
        events,
        active,
        online,
        darkMode
      )}
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
          margin-top: -1px;
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
          height: calc(100vh - 74px);
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
  setConfig: PropTypes.func
};

export default Events;
