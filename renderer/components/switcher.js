import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as sortable from 'react-sortable-hoc';
import ipc from '../utils/ipc';
import CreateTeam from './create-team';
import Avatar from './avatar';

const updateScope = (scope, config, setConfig) => {
  ipc
    .saveConfig(
      {
        currentTeam: scope.isCurrentUser ? null : scope.id
      },
      'config'
    )
    .then(newConfig => {
      const freshConfig = Object.assign({}, newConfig, {
        token: config.token
      });

      setConfig(freshConfig);
    })
    .catch(err => {
      console.error(`Failed to update scope: ${err}`);
    });
};

const renderItem = () => {
  // eslint-disable-next-line new-cap
  return sortable.SortableElement(
    ({ scopes, active, scope, darkMode, initialized, config, setConfig }) => {
      const isActive = active.id === scope.id;
      const index = scopes.indexOf(scope);
      const shouldScale = !initialized;

      const classes = [];

      if (isActive) {
        classes.push('active');
      }

      if (darkMode) {
        classes.push('dark');
      }

      const clicked = event => {
        event.preventDefault();
        updateScope(scope, config, setConfig);
      };

      return (
        <li onClick={clicked} className={classes.join(' ')} key={scope.id}>
          <Avatar
            scope={scope}
            scale={shouldScale}
            delay={index}
            hash={scope.avatar}
          />

          <style jsx>{`
            li {
              width: 23px;
              height: 23px;
              border-radius: 100%;
              margin-right: 10px;
              opacity: 0.3;
              filter: grayscale(1);
              transition-duration: 300ms;
            }

            li:hover {
              filter: grayscale(0);
              opacity: 1;
            }

            li.dark {
              border: 1px solid #666;
            }

            li:last-child {
              margin-right: 0;
            }

            li.active {
              opacity: 1;
              cursor: default;
              filter: grayscale(0);
            }
          `}</style>
        </li>
      );
    }
  );
};

const renderScopes = (
  scopes,
  active,
  darkMode,
  initialized,
  config,
  setConfig
) => {
  const Item = renderItem();

  return scopes.map((scope, index) => (
    <Item
      key={scope.id}
      index={index}
      scope={scope}
      active={active}
      scopes={scopes}
      darkMode={darkMode}
      initialized={initialized}
      config={config}
      setConfig={setConfig}
    />
  ));
};

const renderList = (
  scopes,
  active,
  darkMode,
  initialized,
  config,
  setConfig
) => {
  if (scopes === null || active === null) {
    return null;
  }

  const list = renderScopes(
    scopes,
    active,
    darkMode,
    initialized,
    config,
    setConfig
  );

  // eslint-disable-next-line new-cap
  return sortable.SortableContainer(() => (
    <ul>
      {list}
      <style jsx>{`
        ul {
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: row;
          padding: 0;
          height: inherit;
          align-items: center;
          position: relative;
        }
      `}</style>
    </ul>
  ));
};

const shouldCancelStart = event => {
  if (navigator.platform === 'MacIntel') {
    return !event.metaKey;
  }

  return !event.ctrlKey;
};

const scrollToEnd = (list, event) => {
  event.preventDefault();

  if (!list || !list.current) {
    return;
  }

  const element = list.current;
  element.scrollLeft = element.offsetWidth;
};

const saveScopeOrder = (scopes, config, setConfig) => {
  const scopeOrder = scopes.map(scope => scope.slug);

  ipc
    .saveConfig(
      {
        desktop: { scopeOrder }
      },
      'config'
    )
    .then(newConfig => {
      const freshConfig = Object.assign({}, newConfig, {
        token: config.token
      });

      setConfig(freshConfig);

      console.log('Updated scope order');
    })
    .catch(err => {
      console.log(`Failed to update scope order: ${err}`);
    });
};

const onSortStart = () => {
  document.body.classList.toggle('is-moving');
};

const onSortEnd = (scopes, config, setConfig, { oldIndex, newIndex }) => {
  document.body.classList.toggle('is-moving');

  // Don't update if it was dropped at the same position
  if (oldIndex === newIndex) {
    return;
  }

  const final = sortable.arrayMove(scopes, oldIndex, newIndex);

  saveScopeOrder(final, config, setConfig);
};

const onKeyDown = (event, scopes, config, setConfig) => {
  const code = event.code;
  const number = code.includes('Digit') ? code.split('Digit')[1] : false;

  if (number && number <= 9 && scopes.length > 1) {
    if (scopes[number - 1]) {
      event.preventDefault();

      const relatedScope = scopes[number - 1];
      updateScope(relatedScope, config, setConfig);
    }
  }
};

const openMenu = menu => {
  // The menu toggler element has children
  // we have the ability to prevent the event from
  // bubbling up from those, but we need to
  // use `this.menu` to make sure the menu always gets
  // bounds to the parent
  const { bottom, left, height, width } = menu.current.getBoundingClientRect();

  ipc.openMainMenu({
    x: left,
    y: bottom,
    height,
    width
  });
};

const Switcher = ({ online, darkMode, scopes, active, config, setConfig }) => {
  const [initialized, setInitialized] = useState(false);

  const menu = useRef(null);
  const list = useRef(null);

  const Scopes = renderList(
    scopes,
    active,
    darkMode,
    initialized,
    config,
    setConfig
  );

  useEffect(
    () => {
      if (scopes === null) {
        return;
      }

      const when = 100 + 100 * scopes.length + 600;

      setTimeout(() => {
        // Ensure that the animations for the teams
        // fading in works after recovering from offline mode
        if (!online) {
          return;
        }

        setInitialized(true);
      }, when);
    },
    [JSON.stringify(scopes)]
  );

  useEffect(
    () => {
      const handleOnKeyDown = event => {
        onKeyDown(event, scopes, config, setConfig);
      };

      document.addEventListener('keydown', handleOnKeyDown);

      return () => {
        document.removeEventListener('keydown', handleOnKeyDown);
      };
    },
    [JSON.stringify(scopes)]
  );

  return (
    <span>
      <aside className={darkMode ? 'dark' : ''}>
        {scopes === null || active === null ? (
          <p className="spacer" />
        ) : online ? (
          <div className="list-container" ref={list}>
            <div className="list-scroll">
              <Scopes
                axis="x"
                lockAxis="x"
                shouldCancelStart={shouldCancelStart}
                onSortEnd={onSortEnd.bind(this, scopes, config, setConfig)}
                onSortStart={onSortStart}
                helperClass="switcher-helper"
                lockToContainerEdges={true}
                lockOffset="0%"
              />
              <CreateTeam delay={scopes && scopes.length} darkMode={darkMode} />
            </div>

            <span className="shadow" onClick={scrollToEnd.bind(this, list)} />
          </div>
        ) : (
          <p className="spacer">{'You are offline'}</p>
        )}

        <a
          className="toggle-menu"
          onClick={openMenu.bind(this, menu)}
          onContextMenu={openMenu.bind(this, menu)}
          ref={menu}
        >
          <i />
          <i />
          <i />
        </a>
      </aside>

      <style jsx>{`
        aside {
          height: 40px;
          bottom: 0;
          left: 0;
          right: 0;
          flex-shrink: 0;
          flex-grow: 0;
          border-top: 1px solid #d6d6d6;
          display: flex;
          background: #fff;
          user-select: none;
          justify-content: space-between;
        }

        aside.dark {
          border-top: 1px solid #000;
          background: #2c2c2c;
        }

        aside .toggle-menu {
          display: block;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          flex-shrink: 0;
          z-index: 2000;
          background: #fff;
        }

        aside.dark .toggle-menu {
          background: #2c2c2c;
        }

        aside .toggle-menu i {
          width: 18px;
          height: 1px;
          background: #4e4e4e;
          display: block;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        aside.dark .toggle-menu i {
          background: #b3b3b3;
        }

        aside .toggle-menu i:nth-child(2) {
          margin: 3px 0;
        }

        aside .toggle-menu:hover i {
          opacity: 1;
        }

        .list-scroll {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .list-container {
          flex-shrink: 1;
          flex-grow: 1;
          display: flex;
          height: inherit;
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          padding-left: 10px;
          position: relative;
        }

        .list-container::-webkit-scrollbar {
          display: none;
        }

        .shadow {
          display: block;
          height: 40px;
          width: 20px;
          background: linear-gradient(to right, transparent, #fff);
          position: fixed;
          left: calc(290px - 20px);
          bottom: 0;
          z-index: 2000;
        }

        .dark .shadow {
          background: linear-gradient(to right, transparent, #2c2c2c);
        }

        .spacer {
          margin: 0;
          line-height: 40px;
          padding-left: 10px;
          font-size: 12px;
          color: #4e4e4e;
        }
      `}</style>

      <style jsx global>{`
        .switcher-helper {
          position: relative;
          opacity: 1 !important;
          z-index: 1000;
          overflow: visible;
        }

        .switcher-helper div {
          position: absolute;
          top: 0;
          left: 0;
          animation: scale 0.4s forwards;
        }

        body.is-moving {
          cursor: move;
        }

        @keyframes scale {
          0% {
            transform: scale(1);
          }

          100% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </span>
  );
};

Switcher.propTypes = {
  online: PropTypes.bool,
  darkMode: PropTypes.bool,
  active: PropTypes.object,
  config: PropTypes.object,
  scopes: PropTypes.array,
  setConfig: PropTypes.func
};

export default Switcher;
