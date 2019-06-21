import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ms from 'ms';
import * as Sentry from '@sentry/browser';
import dateDiff from '../utils/date-diff';
import ipc from '../utils/ipc';
import pkg from '../../package';
import Avatar from './avatar';
import Message from './message';

if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: pkg.sentryDsn
  });
}

const parseDate = date => {
  const current = new Date();
  const difference = dateDiff(current, date, 'milliseconds');

  const checks = {
    '1 minute': 'seconds',
    '1 hour': 'minutes',
    '1 day': 'hours',
    '7 days': 'days',
    '31 days': 'weeks',
    '1 year': 'months'
  };

  for (const check in checks) {
    if (!{}.hasOwnProperty.call(checks, check)) {
      continue;
    }

    const unit = checks[check];
    const shortUnit = unit === 'months' ? 'mo' : unit.charAt(0);

    if (difference < ms(check)) {
      if (dateDiff(current, date, unit) === 0) {
        console.log(current.getTime(), date);
      }

      return dateDiff(current, date, unit) + shortUnit;
    }
  }

  return null;
};

class Event extends React.Component {
  state = {
    url: null,
    menu: null,
    error: null
  };

  componentDidMount = () => {
    this.setUrl();
    this.setMenu();
  };

  componentDidCatch = (error, errorInfo) => {
    console.error('Failed to handle event:', error);
    this.setState({ error: true });

    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  };

  setUrl = () => {
    const { event } = this.props;

    const linkEntity =
      event.entities.find(e => e.type === 'link') ||
      event.entities.find(e => e.type === 'deployment_host');

    if (linkEntity) {
      const url = event.text.substring(linkEntity.start, linkEntity.end);

      this.setState({ url });
    }
  };

  setMenu = () => {
    const { event } = this.props;

    let dashboardUrl = null;
    let id = null;

    const deploymentEntity = event.entities.find(
      e => e.type === 'deployment_host'
    );

    if (deploymentEntity) {
      const host = event.text.substring(
        deploymentEntity.start,
        deploymentEntity.end
      );

      dashboardUrl = `https://zeit.co/deployments/${host}`;
    }

    // Deleted user / created team
    if (event.text.includes('deleted') || event.text.includes('created team')) {
      const slugEntity = event.entities[event.entities.length - 1];
      id = event.text.substring(slugEntity.start, slugEntity.end);
    }

    // Alias / deployment
    const linkEntity =
      event.entities.find(e => e.type === 'link') ||
      event.entities.find(e => e.type === 'deployment_host');

    if (linkEntity) {
      id = event.text.substring(linkEntity.start, linkEntity.end);
    }

    this.setState({
      menu: {
        url: this.state.url,
        id,
        dashboardUrl
      }
    });
  };

  click = (event, setScopeWithSlug, url) => {
    if (event.type === 'team' && setScopeWithSlug) {
      setScopeWithSlug(event.payload.slug);
      return;
    }

    if (!url) {
      return;
    }

    ipc.openURL(`https://${url}`);
  };

  rightClick = (menu, event) => {
    event.preventDefault();

    ipc.openEventMenu(
      {
        x: event.clientX,
        y: event.clientY
      },
      menu
    );
  };

  render() {
    const { event, active, setScopeWithSlug, darkMode } = this.props;
    const { url, menu, error } = this.state;

    const parsedDate = parseDate(
      event.createdAt || new Date(event.created).getTime()
    );

    const githubLoginEntity = event.entities.find(
      ({ type }) => type === 'github_login'
    );

    const githubLogin = githubLoginEntity ? githubLoginEntity.login : null;

    const avatarHash = githubLogin ? null : event.user && event.user.avatar;

    const classes = classNames({
      event: true,
      darkMode
    });

    return (
      <figure
        className={classes}
        onClick={
          error ? () => {} : () => this.click(event, setScopeWithSlug, url)
        }
        onContextMenu={
          error ? e => e.preventDefault() : e => this.rightClick(menu, e)
        }
      >
        {error ? (
          <figcaption>
            <p style={{ marginLeft: 12 }}>This event could not be displayed</p>
          </figcaption>
        ) : (
          <>
            <Avatar
              event={event}
              scope={active}
              hash={avatarHash}
              darkMode={darkMode}
            />

            <figcaption>
              <Message {...event} />
              <span>{parsedDate}</span>
            </figcaption>
          </>
        )}

        <style jsx>{`
          figure {
            margin: 0;
            display: flex;
            justify-content: space-between;
            background: #ffffff;
          }

          figure.darkMode {
            background: #1f1f1f;
          }

          figure:hover {
            background: #f0f0f0;
          }

          figure.darkMode:hover {
            background: #333;
          }

          figure figcaption {
            border-top: 1px solid #f5f5f5;
            padding: 10px 10px 10px 0;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            flex-shrink: 1;
            word-break: break-word;
            flex-grow: 1;
          }

          figure.darkMode figcaption {
            border-top: 1px solid #333;
          }

          figure:last-child figcaption {
            padding-bottom: 10px;
          }

          figure:last-child figcaption {
            border-bottom: 0;
          }

          figure figcaption span {
            font-size: 10px;
            color: #9b9b9b;
            flex-shrink: 0;
          }
        `}</style>

        <style jsx global>{`
          h1 + .event figcaption {
            border-top: 0 !important;
          }

          .event p {
            font-size: 12px;
            margin: 0;
            line-height: 17px;
            display: block;
            color: #666;
            padding-right: 10px;
            flex-shrink: 1;
          }

          .event.darkMode p {
            color: #999;
          }

          .event p b {
            font-weight: normal;
            color: #000;
          }

          .event.darkMode p b {
            color: #fff;
          }

          .event p code {
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, serif;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 12px;
            margin: 5px 0;
            display: block;
          }

          .event.darkMode p code {
            background: #333;
            color: #ccc;
          }

          .event:hover p code {
            background: #e8e8e8;
          }

          .event.darkMode:hover p code {
            background: #464646;
          }
        `}</style>
      </figure>
    );
  }
}

Event.propTypes = {
  event: PropTypes.object,
  active: PropTypes.object,
  user: PropTypes.object,
  setScopeWithSlug: PropTypes.func,
  darkMode: PropTypes.bool
};

export default Event;
