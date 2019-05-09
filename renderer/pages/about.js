import Router from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ms from 'ms';
import darkModeEffect from '../effects/dark-mode';
import Title from '../components/title';
import ipc from '../utils/ipc';
import pkg from '../../package.json'; // eslint-disable-line import/extensions

const AUTHORS = [
  { name: 'Leo Lamprecht', link: 'https://twitter.com/notquiteleo' },
  { name: 'Evil Rabbit', link: 'https://twitter.com/evilrabbit_' },
  { name: 'Max Rovensky', link: 'https://twitter.com/MaxRovensky' },
  { name: 'Matheus Fernandes', link: 'https://twitter.com/matheusfrndes' }
];

const AuthorLink = ({ name, link, darkMode }) => (
  <a
    href={link}
    className={darkMode ? 'dark' : ''}
    onClick={e => {
      e.preventDefault();
      ipc.openURL(link);
      e.target.blur();
    }}
  >
    {name}
    <style jsx>
      {`
        a {
          font-size: 12px;
          color: #333;
          text-decoration: none;
          margin-left: 10px;
          line-height: 18px;
          outline: 0;
        }

        a:hover,
        a:focus {
          color: black;
        }
        a:last-child {
          margin-bottom: 10px;
        }

        a.dark {
          color: #ccc;
        }

        a.dark:hover,
        a.dark:focus {
          color: white;
        }
      `}
    </style>
  </a>
);

AuthorLink.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string,
  darkMode: PropTypes.bool
};

const About = () => {
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    return darkModeEffect(darkMode, setDarkMode);
  });

  const onClose = () => {
    Router.replace('/feed');
  };

  /* eslint-disable no-undef */
  const ago =
    typeof BUILD_DATE === 'string'
      ? BUILD_DATE
      : `${ms(Date.now() - new Date(BUILD_DATE).getTime())} ago`;
  /* eslint-enable no-undef */

  return (
    <main className={darkMode ? 'dark' : ''}>
      <Title darkMode={darkMode} title="About" onClose={onClose} />

      <section>
        <img
          src="/static/app-icon.png"
          width="90px"
          height="90px"
          alt="Now Desktop Logo"
          style={{ marginTop: 10 }}
        />

        <h1>Now</h1>
        <h2>
          Version <b>{pkg.version}</b> ({ago})
        </h2>
      </section>

      <section className="authors">
        <h3>AUTHORS</h3>
        {AUTHORS.map(author => (
          <AuthorLink key={author.link} darkMode={darkMode} {...author} />
        ))}
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

        h1 {
          font-size: 16px;
          color: #444;
        }

        h2 {
          font-size: 12px;
          font-weight: 400;
          color: #444;
          margin-top: 0;
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

        .authors {
          font-size: 12px;
          background-color: white;
          text-align: left;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }

        .authors h3 {
          font-size: 12px;
          color: #444;
          margin-left: 10px;
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

        .dark *,
        .dark .authors h3 {
          color: #ccc;
        }

        .dark footer a:hover,
        .dark footer a:focus {
          color: white;
        }

        .dark .authors {
          background-color: #1f1f1f;
          border-color: #444;
        }

        .dark .divider {
          border-color: #666;
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

export default About;
