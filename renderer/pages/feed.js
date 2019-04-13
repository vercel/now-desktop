import { useState, useEffect, useMemo } from 'react';
import Title from '../components/title';
import Switcher from '../components/feed/switcher';
import Events from '../components/events';
import onlineEffect from '../effects/online';
import configEffect from '../effects/config';
import darkModeEffect from '../effects/dark-mode';
import scopesEffect from '../effects/scopes';
import activeEffect from '../effects/active';
import scopeOrderMemo from '../memos/scope-order';

const Main = () => {
  const [scopes, setScopes] = useState(null);
  const [active, setActive] = useState(null);
  const [darkMode, setDarkMode] = useState(null);
  const [config, setConfig] = useState(null);
  const [online, setOnline] = useState(true);

  // This effect (and read below)...
  useEffect(() => {
    return onlineEffect(online, setOnline);
  });

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  useEffect(
    () => {
      return configEffect(config, setConfig);
    },

    // Never re-invoke this effect.
    []
  );

  useEffect(
    () => {
      // Wait until the config is defined.
      if (config === null) {
        return;
      }

      return scopesEffect(config, setScopes);
    },

    // Only re-invoke this effect if the config changes.
    [config && config.lastUpdate]
  );

  useEffect(
    () => {
      // Wait until the scopes are defined.
      if (scopes === null || scopes.length === 0) {
        return;
      }

      return activeEffect(config, scopes, setActive);
    },

    // Only re-invoke this effect if the scopes or config change.
    [config && config.lastUpdate, JSON.stringify(scopes)]
  );

  const scopeOrder = config && config.desktop && config.desktop.scopeOrder;

  const orderedScopes = useMemo(
    () => {
      // Wait until the config and scopes are defined.
      if (config === null || scopes === null) {
        return scopes;
      }

      return scopeOrderMemo(scopeOrder, scopes);
    },

    // Only re-invoke this effect if the scopes or scope order change.
    [JSON.stringify(scopeOrder), JSON.stringify(scopes)]
  );

  return (
    <main>
      <div onDragEnter={() => {}}>
        <Title config={config} active={active} darkMode={darkMode} />

        <Events
          config={config}
          online={online}
          scopes={scopes}
          active={active}
          darkMode={darkMode}
        />

        <Switcher
          config={config}
          online={online}
          darkMode={darkMode}
          active={active}
          scopes={orderedScopes}
          setConfig={setConfig}
        />
      </div>

      <style jsx>{`
        main,
        div {
          display: flex;
          flex-direction: column;
        }

        main {
          height: 100vh;
        }

        div {
          flex-shrink: 1;
          position: relative;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
};

export default Main;
