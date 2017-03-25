// Native
import { platform } from 'os';

// Packages
import React from 'react';
import timeAgo from 'time-ago';
import Head from 'next/head';

// Vectors
import CloseWindowSVG from '../vectors/close-window';
import UpdatedSVG from '../vectors/updated';

// Helpers
import showError from '../utils/error';
import remote from '../utils/electron';

const About = React.createClass({
  getInitialState() {
    return {
      licenses: [],
      lastReleaseDate: ''
    };
  },
  async loadLicenses() {
    const links = document.querySelectorAll('a');

    for (const link of links) {
      const url = link.href;

      if (url) {
        link.addEventListener('click', event => {
          remote.shell.openExternal(url);
          event.preventDefault();
        });
      }
    }

    const getLicenses = remote.require('load-licenses');
    const mainModule = remote.process.mainModule;

    this.setState({
      licenses: getLicenses(mainModule)
    });

    await this.lastReleaseDate();
  },
  async lastReleaseDate() {
    let data;

    try {
      data = await fetch(
        'https://api.github.com/repos/zeit/now-desktop/releases'
      );
    } catch (err) {
      console.log(err);
      return;
    }

    if (!data.ok) {
      return;
    }

    try {
      data = await data.json();
    } catch (err) {
      console.log(err);
      return;
    }

    let localRelease;

    for (const release of data) {
      if (release.tag_name === remote.app.getVersion()) {
        localRelease = release;
      }
    }

    if (!localRelease) {
      return;
    }

    const setReleaseDate = () => {
      const ago = timeAgo().ago(new Date(localRelease.published_at));

      this.setState({
        lastReleaseDate: `(${ago})`
      });
    };

    setReleaseDate();

    // Make sure the date stays updated
    setInterval(setReleaseDate, 1000);
  },
  async componentDidMount() {
    await this.loadLicenses();
  },
  handleTutorial() {
    const tutorial = remote.getGlobal('tutorial');

    if (!tutorial) {
      showError('Not able to open tutorial window');
      return;
    }

    tutorial.reload();

    tutorial.on('ready-to-show', () => {
      tutorial.show();
    });
  },
  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  },
  prepareLicense(info) {
    let element = '<details>';

    element += `<summary>${info.name}</summary>`;
    element += `<p>${info.license}</p>`;
    element += '</details>';

    return element;
  },
  readLicenses() {
    const licenses = this.state.licenses;

    if (licenses.length === 0) {
      return '';
    }

    let elements = '';

    for (const license of licenses) {
      elements += this.prepareLicense(license);
    }

    return elements;
  },
  updateStatus() {
    const isDev = remote.require('electron-is-dev');

    if (isDev) {
      return (
        <h2 className="update development">
          {"You're in development mode. No updates!"}
        </h2>
      );
    }

    return (
      <h2 className="update latest">
        <UpdatedSVG onClick={this.handleCloseClick} width="13px" />
        {"You're running the latest version!"}
      </h2>
    );
  },
  render() {
    return (
      <div>
        <Head>
          <link rel="stylesheet" href="/static/app.css" />
        </Head>

        {platform() === 'win32' &&
          <div className="window-controls">
            <CloseWindowSVG onClick={this.handleCloseClick} />
          </div>}
        <section id="about">
          <span className="window-title">About</span>

          <img src="/static/app-icon.png" />

          <h1>Now</h1>
          <h2>
            Version
            {' '}
            <b>{remote.app.getVersion()}</b>
            {' '}
            {this.state.lastReleaseDate}
          </h2>

          {this.updateStatus()}

          <article>
            <h1>Authors</h1>

            <p>
              <a href="https://twitter.com/notquiteleo">Leo Lamprecht</a><br />
              <a href="https://twitter.com/evilrabbit_">Evil Rabbit</a><br />
              <a href="https://twitter.com/rauchg">Guillermo Rauch</a><br />
              <a href="https://twitter.com/matheusfrndes">Matheus Fernandes</a>
            </p>

            <h1>{'3rd party software'}</h1>
            <section
              dangerouslySetInnerHTML={{ __html: this.readLicenses() }}
            />
          </article>

          <span className="copyright">
            Made by <a href="https://zeit.co">ZEIT</a>
          </span>

          <nav>
            <a href="https://zeit.co/docs">Docs</a>
            <a href="https://github.com/zeit/now-desktop">Source</a>
            <a onClick={this.handleTutorial}>Tutorial</a>
          </nav>
        </section>

        <style jsx>
          {
            `
          div {
            background: #ECECEC;
            height: 100vh;
          }
        `
          }
        </style>
      </div>
    );
  }
});

export default About;
