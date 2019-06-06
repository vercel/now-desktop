import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import * as deploymentEffects from '../effects/deployment';
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
  const [hashesCalculated, setHashesCalculated] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
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
      const loginPath = window.location.href.includes('http')
        ? '/login'
        : `${window.appPath}/renderer/out/login/index.html`;
      router.replace(loginPath);
    });
  });

  useEffect(() => {
    return trayDragEffect(null, () => setShowDropZone(true));
  });

  useEffect(() => {
    return deploymentEffects.deploymentStateChanged((_, dpl) => {
      setActiveDeployment(dpl);

      if (activeDeploymentBuilds.length === 0) {
        setActiveDeploymentBuilds(dpl.builds);
      }
    });
  });

  useEffect(() => {
    return deploymentEffects.hashesCalculated(() => {
      setHashesCalculated(true);
    });
  }, []);

  useEffect(() => {
    return deploymentEffects.filesUploaded(() => setFilesUploaded(true));
  }, []);

  useEffect(() => {
    return deploymentEffects.error((_, err) => {
      console.error(err);
      setActiveDeploymentBuilds([]);
      setDeploymentError(err);
      setActiveDeployment(null);

      // Hide error after 3 seconds
      setTimeout(() => {
        setDeploymentError(null);
      }, 3000);
    });
  }, []);

  useEffect(() => {
    return deploymentEffects.ready((_, dpl) => {
      setActiveDeployment({ ready: true });
      setActiveDeploymentBuilds([]);
      setHashesCalculated(false);
      setFilesUploaded(false);

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
  }, []);

  useEffect(() => {
    return deploymentEffects.buildStateChanged((_, build) => {
      const nextBuilds = activeDeploymentBuilds.filter(b => b.id !== build.id);
      nextBuilds.push(build);

      setActiveDeploymentBuilds(nextBuilds);
    });
  });

  useEffect(() => {
    if (router.query.disableScopesAnimation) {
      router.replace('/feed', '/feed', { shallow: true });
    }

    return aboutScreenEffect(null, () => {
      const aboutPath = window.location.href.includes('http')
        ? '/about'
        : `${window.appPath}/renderer/out/about/index.html`;
      router.replace(aboutPath);
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

  const createDeployment = async path => {
    setActiveDeployment(null);
    setDeploymentError(null);
    setFilesUploaded(false);
    setHashesCalculated(false);

    // Show "preparing" feedback immediately
    setActiveDeployment({});

    ipc.createDeployment(path, {
      teamId: config.currentTeam,
      token: config.token
    });
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
            onDrop={(files, defaultName) =>
              createDeployment(files, defaultName)
            }
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
          filesUploaded={filesUploaded}
          hashesCalculated={hashesCalculated}
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
