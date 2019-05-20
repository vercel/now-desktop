import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ms from 'ms';
import semVer from 'semver';
import darkModeEffect from '../effects/dark-mode';
import versionEffect from '../effects/version';
import Title from '../components/title';
import Spinner from '../components/spinner';
import ipc from '../utils/ipc';
import pkg from '../../package.json'; // eslint-disable-line import/extensions

const About = ({ router }) => {
  const [darkMode, setDarkMode] = useState(router.query.darkMode);
  const [latestVersion, setLatestVersion] = useState(null);

  useEffect(() => {
    return versionEffect(latestVersion, setLatestVersion);
  });

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  /* eslint-disable no-undef */
  const ago =
    typeof BUILD_DATE === 'string'
      ? BUILD_DATE
      : `${ms(Date.now() - new Date(BUILD_DATE).getTime())} ago`;
  /* eslint-enable no-undef */

  const checking = !latestVersion;
  const hasLatest = latestVersion
    ? semVer.gt(latestVersion, pkg.version)
    : false;

  return (
    <main className={darkMode ? 'dark' : ''}>
      <Title darkMode={darkMode} title="About" />

      <section>
        <img
          src="/static/app-icon.png"
          width="90px"
          height="90px"
          alt="Now Desktop Logo"
          style={{ marginTop: 10 }}
          draggable={false}
        />

        <h1>Now</h1>
        <h2>
          Version <b>{pkg.version}</b>
          {checking ? (
            <Spinner darkBg={darkMode} width={14} style={{ marginTop: 4 }} />
          ) : hasLatest ? (
            `Update available: ${latestVersion}`
          ) : (
            `Latest (${ago})`
          )}
        </h2>
        <br />
        <button
          className="check-updates"
          onClick={() => {
            setLatestVersion(null);
            ipc.checkLatestVersion();
          }}
        >
          Check for updates
        </button>
      </section>

      <footer>
        <span>
          Made by{' '}
          <a
            href="https://zeit.co"
            onClick={e => {
              e.preventDefault();
              ipc.openURL('https://zeit.co');
              e.target.blur();
            }}
          >
            ZEIT
          </a>
        </span>
        <nav>
          <a
            href="https://zeit.co/docs"
            onClick={e => {
              e.preventDefault();
              ipc.openURL('https://zeit.co/docs');
              e.target.blur();
            }}
          >
            Docs
          </a>
          <div className="divider" />
          <a
            href="https://zeit.co/guides"
            onClick={e => {
              e.preventDefault();
              ipc.openURL('https://zeit.co/guides');
              e.target.blur();
            }}
          >
            Guides
          </a>
          <div className="divider" />
          <a
            href="https://github.com/zeit/now-desktop"
            onClick={e => {
              e.preventDefault();
              ipc.openURL('https://github.com/zeit/now-desktop');
              e.target.blur();
            }}
          >
            Source
          </a>
        </nav>
      </footer>

      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #ececec;
        }

        main > section {
          margin-top: 20px;
        }

        h1 {
          font-size: 16px;
          color: #444;
        }

        h2 {
          font-size: 12px;
          font-weight: 400;
          color: #444;
          margin-top: 0;
          text-align: center;
          line-height: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        main {
          height: 100vh;
        }

        section {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .check-updates {
          text-decoration: none;
          color: #111;
          font-size: 12px;
          font-weight: 500;
          line-height: 18px;
          outline: 0;
          border: 0;
          background: 0;
          padding: 0;
          margin: 0;
          cursor: pointer;
        }

        footer {
          flex-grow: 1;
          display: flex;
          width: 100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #444;
          font-weight: 500;
          justify-content: flex-end;
          padding-bottom: 20px;
        }

        footer a {
          text-decoration: none;
          color: #444;
          line-height: 18px;
          font-weight: 700;
          outline: 0;
        }

        footer a:hover {
          color: black;
        }

        nav {
          display: flex;
          align-items: center;
        }

        nav a {
          margin: 0 10px;
        }

        .divider {
          height: 10px;
          width: 1px;
          border-left: 1px solid #bbb;
        }

        main.dark {
          background-color: #333;
        }

        .dark * {
          color: #ccc;
        }

        .dark footer a:hover,
        .dark footer a:focus {
          color: white;
        }

        .dark .divider {
          border-color: #666;
        }

        .dark .check-updates {
          color: #eee;
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
          user-select: none;
        }
      `}</style>
    </main>
  );
};

About.propTypes = {
  router: PropTypes.object
};

export default withRouter(About);
