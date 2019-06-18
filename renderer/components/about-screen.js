import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ms from 'ms';
import semVer from 'semver';
import versionEffect from '../effects/version';
import Logo from '../vectors/logo-about';
import Title from './title';
import Spinner from './spinner';

const About = ({ darkMode, config, onBackClick }) => {
  const [latestVersion, setLatestVersion] = useState(null);

  useEffect(() => {
    return versionEffect(config, setLatestVersion);
  });

  /* eslint-disable no-undef */
  const ago =
    typeof BUILD_DATE === 'string'
      ? BUILD_DATE
      : `${ms(Date.now() - new Date(BUILD_DATE).getTime())} ago`;
  /* eslint-enable no-undef */

  const checking = !latestVersion;
  const hasLatest =
    typeof window !== 'undefined' && latestVersion
      ? semVer.gt(latestVersion, window.appVersion)
      : false;

  return (
    <main className={darkMode ? 'dark' : ''}>
      <Title darkMode={darkMode} title="About" onBackClick={onBackClick} />

      <section>
        <Logo darkMode={darkMode} style={{ marginBottom: 15, marginTop: 10 }} />

        <h1>Now</h1>
        <h2>
          {typeof window === 'undefined' ? '' : window.appVersion}
          <span>
            {checking ? (
              <Spinner darkBg={darkMode} width={14} />
            ) : hasLatest ? (
              `Update available: ${latestVersion}`
            ) : (
              `Latest (${ago})`
            )}
          </span>
        </h2>
        <br />
        <button
          className={`check-updates ${checking ? 'disabled' : ''}`}
          onClick={() => {
            if (checking) {
              return;
            }

            setLatestVersion(null);
            versionEffect(config, setLatestVersion);
          }}
        >
          Check for updates
        </button>
      </section>

      <footer>
        <span>© 2019 - ZEIT, Inc. All Rights Reserved.</span>
      </footer>

      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: white;
        }

        main > section {
          margin-top: 20px;
        }

        h1 {
          font-size: 18px;
          color: black;
        }

        h2 {
          font-size: 16px;
          font-weight: 600;
          color: black;
          margin-top: 0;
          text-align: center;
          line-height: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 24px;
        }

        h2 span {
          font-size: 12px;
          color: #666666;
          margin-left: 5px;
          margin-top: 2px;
          line-height: 16px;
          font-weight: 400;
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
          color: white;
          background-color: #0076ff;
          font-size: 12px;
          font-weight: 500;
          line-height: 18px;
          outline: 0;
          border: 0;
          border-radius: 5px;
          padding: 5px 25px;
          text-transform: uppercase;
          margin: 0;
          cursor: pointer;
        }

        .check-updates.disabled {
          background-color: #ccc;
          cursor: not-allowed;
          margin-top: 2px;
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
          background-color: #1f1f1f;
        }

        .dark * {
          color: white;
        }

        .dark h2 span {
          color: #ccc;
        }

        .dark footer * {
          color: #ccc;
        }

        .dark .divider {
          border-color: #444;
        }

        .dark .check-updates {
          color: white;
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
  darkMode: PropTypes.bool,
  config: PropTypes.object,
  onBackClick: PropTypes.func
};

export default About;
