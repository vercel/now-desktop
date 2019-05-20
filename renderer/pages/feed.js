import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useRef } from 'react';
import Deployment from 'now-client';
import ipc from '../utils/ipc';
import Title from '../components/title';
import Switcher from '../components/switcher';
import Events from '../components/events';
import onlineEffect from '../effects/online';
import configEffect from '../effects/config';
import darkModeEffect from '../effects/dark-mode';
import scopesEffect from '../effects/scopes';
import activeEffect from '../effects/active';
import logoutEffect from '../effects/logout';
import trayDragEffect from '../effects/tray-drag';
import aboutScreenEffect from '../effects/about-screen';
import scopeOrderMemo from '../memos/scope-order';
import DropZone from '../components/dropzone';
import DeploymentBar from '../components/deployment-bar';

const Main = ({ router }) => {
  const [scopes, setScopes] = useState(null);
  const [active, setActive] = useState(null);
  const [darkMode, setDarkMode] = useState(router.query.darkMode || null);
  const [config, setConfig] = useState(null);
  const [online, setOnline] = useState(true);
  const [showDropZone, setShowDropZone] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [activeDeploymentBuilds, setActiveDeploymentBuilds] = useState([]);
  const [deploymentError, setDeploymentError] = useState(null);

  const fileInput = useRef();

  // This effect (and read below)...
  useEffect(() => {
    return onlineEffect(online, setOnline);
  });

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  useEffect(() => {
    return logoutEffect(null, () => {
      router.replace('/login');
    });
  });

  useEffect(() => {
    return trayDragEffect(null, () => setShowDropZone(true));
  });

  useEffect(() => {
    if (router.query.disableScopesAnimation) {
      router.replace('/feed', '/feed', { shallow: true });
    }

    return aboutScreenEffect(null, () => {
      router.replace(`/about?darkMode=${darkMode}`);
    });
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
      if (!config || scopes === null || scopes.length === 0) {
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

  const createDeployment = async files => {
    if (!files || files.length === 0) {
      return;
    }

    const deployment = new Deployment(files, config.token, {
      teamId: config.currentTeam
    });

    setDeploymentError(null);
    setActiveDeployment(deployment);

    const handleError = err => {
      setActiveDeployment(null);
      setActiveDeploymentBuilds([]);
      setDeploymentError(err);
    };

    deployment.on('error', handleError);

    deployment.on('created', setActiveDeployment);
    deployment.on('deployment-state-changed', setActiveDeployment);

    deployment.on('build-state-changed', build => {
      const nextBuilds = activeDeploymentBuilds.filter(b => b.id !== build.id);
      nextBuilds.push(build);
      setActiveDeploymentBuilds(nextBuilds);
    });

    deployment.on('ready', dpl => {
      setActiveDeployment({ ready: true });
      setActiveDeploymentBuilds([]);

      if (fileInput.current) {
        fileInput.current.value = null;
      }

      const notification = new Notification('Copied URL to Clipboard', {
        body: 'Opening the deployment in your browser...'
      });

      notification.addEventListener('click', () => {
        ipc.openURL(`https://${dpl.url}`);
      });

      ipc.openURL(`https://${dpl.url}`);
      setTimeout(() => setActiveDeployment(null), 3000);
    });

    deployment.deploy();
  };

  return (
    <main>
      <div onDragEnter={() => setShowDropZone(true)}>
        <Title
          config={config}
          active={active}
          darkMode={darkMode}
          fileInput={fileInput.current}
        />

        {showDropZone && (
          <DropZone
            darkMode={darkMode}
            hide={() => setShowDropZone(false)}
            onDrop={files => createDeployment(files)}
          />
        )}

        <Events
          config={config}
          setConfig={setConfig}
          online={online}
          scopes={scopes}
          active={active}
          darkMode={darkMode}
          setActive={setActive}
        />

        <DeploymentBar
          activeDeployment={activeDeployment}
          activeDeploymentBuilds={activeDeploymentBuilds}
          error={deploymentError}
          onErrorClick={() => setDeploymentError(null)}
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

      <input
        type="file"
        ref={fileInput}
        className="file-input"
        onChange={e => createDeployment(e.target.files)}
        multiple
      />

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

        .file-input {
          position: absolute;
          left: -999px;
          top: -999px;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
          overflow: hidden;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </main>
  );
};

Main.propTypes = {
  router: PropTypes.object
};

export default withRouter(Main);
