import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import dotProp from 'dot-prop';
import ms from 'ms';
import * as Sentry from '@sentry/browser';
import dateDiff from '../utils/date-diff';
import ipc from '../utils/ipc';
import pkg from '../../package';
import Avatar from './avatar';
import messageComponents from './messages';

if (typeof window !== 'undefined') {
  Sentry.init.init({
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
    '30 days': 'weeks',
    '1 year': 'months'
  };

  for (const check in checks) {
    if (!{}.hasOwnProperty.call(checks, check)) {
      continue;
    }

    const unit = checks[check];
    const shortUnit = unit === 'months' ? 'mo' : unit.charAt(0);

    if (difference < ms(check)) {
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

    // Set URL
    const urlProps = [
      'payload.cn',
      'payload.alias',
      'payload.url',
      'payload.domain',
      'payload.deploymentUrl'
    ];

    for (const prop of urlProps) {
      const url = dotProp.get(event, prop);

      this.setState({ url });

      if (url) {
        break;
      }
    }
  };

  setMenu = () => {
    const { event } = this.props;

    let dashboardUrl = null;
    let id = null;

    if (event.type === 'deployment') {
      const { deploymentUrl, url } = event.payload;
      const host = deploymentUrl || url;

      dashboardUrl = `https://zeit.co/deployments/${host}`;
    }

    const props = [
      'payload.deletedUser.username',
      'payload.slug',
      'payload.aliasId',
      'payload.deploymentId'
    ];

    for (const prop of props) {
      id = dotProp.get(event, prop);

      if (id) {
        break;
      }
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
    const { event, active, user, setScopeWithSlug, darkMode } = this.props;
    const { url, menu, error } = this.state;

    const Message = messageComponents.get(event.type);
    const parsedDate = parseDate(parseDate);

    const avatarHash = event.user && event.user.avatar;

    if (!Message) {
      return null;
    }

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
              <Message user={user} event={event} active={active} />
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
