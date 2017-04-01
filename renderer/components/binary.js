// Native
import { execSync } from 'child_process';

// Packages
import React from 'react';
import semVer from 'semver';
import pathType from 'path-type';
import exists from 'path-exists';

// Utilities
import installBinary from '../utils/load-binary';
import remote from '../utils/electron';

const Binary = React.createClass({
  getInitialState() {
    return {
      binaryInstalled: false,
      installing: false,
      done: false,
      downloading: false
    };
  },
  async isOlderThanLatest(utils, binaryPath) {
    let current;

    try {
      current = await utils.getURL();
    } catch (err) {
      return;
    }

    if (!current) {
      return;
    }

    const remoteVersion = current.version;
    let localVersion;

    try {
      localVersion = execSync(binaryPath + ' -v').toString();
    } catch (err) {
      return;
    }

    const comparision = semVer.compare(remoteVersion, localVersion);

    if (comparision === 1) {
      return true;
    }

    return false;
  },
  async componentDidMount() {
    const binaryUtils = remote.require('./utils/binary');
    const binaryPath = binaryUtils.getFile();

    if (!await exists(binaryPath)) {
      return;
    }

    if (await pathType.symlink(binaryPath)) {
      return;
    }

    if (await this.isOlderThanLatest(binaryUtils, binaryPath)) {
      return;
    }

    const currentWindow = remote.getCurrentWindow();
    currentWindow.focus();

    this.setState({
      binaryInstalled: true
    });
  },
  render() {
    const element = this;

    let classes = 'button install';
    let installText = 'Install now';

    if (this.state.binaryInstalled) {
      classes += ' off';
      installText = 'Already installed';
    }

    const binaryButton = {
      className: classes,
      async onClick() {
        if (element.state.binaryInstalled) {
          return;
        }

        await installBinary(element);
      }
    };

    if (this.state.installing) {
      const loadingText = this.state.downloading ? 'Downloading' : 'Installing';

      return (
        <article>
          <p className="install-status">
            <strong>{loadingText} the binary</strong>

            <i>.</i>
            <i>.</i>
            <i>.</i>
          </p>
          <p>
            Please be so kind and leave the app open! We'll let you know once we are done. This should not take too long.
          </p>

          <style jsx>
            {
              `
            article {
              width: 415px;
              font-size: 14px;
              text-align: center;
              line-height: 22px;
            }

            .install-status i {
              font-weight: 700;
              font-style: normal;
              animation-name: blink;
              animation-duration: 1.4s;
              animation-iteration-count: infinite;
              animation-fill-mode: both;
              font-size: 150%;
            }

            .install-status i:nth-child(3) {
              animation-delay: .2s;
            }

            .install-status i:nth-child(4) {
              animation-delay: .4s;
            }

            @keyframes blink {
              0% {
                opacity: 0.1;
              }

              20% {
                opacity: 1;
              }

              100% {
                opacity: .2;
              }
            }
          `
            }
          </style>
        </article>
      );
    }

    if (this.state.done) {
      return (
        <article>
          <p><strong>Hooray! 🎉</strong></p>
          <p>The binary successfully landed in its directory!</p>
          <p>You can now use <code>now</code> from the command line.</p>

          <style jsx>
            {
              `
            article {
              width: 415px;
              font-size: 14px;
              text-align: center;
              line-height: 22px;
            }

            code {
              font-weight: 700;
              background: #212121;
              padding: 1px 7px;
              border-radius: 3px;
            }
          `
            }
          </style>
        </article>
      );
    }

    return (
      <article>
        <p>
          In addition to this app, you can also use
          {' '}
          <code>now</code>
          {' '}
          from the command line, if you'd like to.
        </p>
        <p>
          Press the button below to install it! When a new version gets released, we'll automatically update it for you.
        </p>

        <a {...binaryButton}>{installText}</a>

        <style jsx>
          {
            `
          article {
            width: 415px;
            font-size: 14px;
            text-align: center;
            line-height: 22px;
          }

          code {
            font-weight: 700;
            background: #212121;
            padding: 1px 7px;
            border-radius: 3px;
          }

          .button {
            font-weight: 700;
            text-transform: uppercase;
            background: #000;
            border: 2px solid #fff;
            text-align: center;
            text-decoration: none;
            color: #fff;
            font-size: 12px;
            padding: 8px 20px;
            transition: all .2s ease;
            cursor: pointer;
            display: inline-block;
            line-height: normal;
            -webkit-app-region: no-drag;
          }

          .button:hover {
            background: #fff;
            color: #000;
          }

          .install {
            margin-top: 20px;
            display: inline-block;
          }

          .install.off {
            background: transparent;
            font-size: 13px;
            cursor: default;
          }

          .install.off:hover {
            color: #d0d0d0;
          }
        `
          }
        </style>
      </article>
    );
  }
});

export default Binary;
