import { PureComponent } from 'react';
import { object, func, string, bool } from 'prop-types';
import dotProp from 'dot-prop';
import ms from 'ms';
import * as Sentry from '@sentry/browser';
import pkg from '../../../package';
import dateDiff from '../../utils/date-diff';
import ipc from '../../utils/ipc';
import Avatar from './avatar';

// Check if this is on the client,
// since the build won't work otherwise
if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: pkg.sentryDsn
  });
}

class EventMessage extends PureComponent {
  state = {
    url: null,
    hasError: false
  };

  click = () => {
    const { content, setScopeWithSlug } = this.props;
    const { url } = this.state;

    if (content.type === 'team' && setScopeWithSlug) {
      setScopeWithSlug(content.payload.slug);
      return;
    }

    if (!url) {
      return;
    }

    ipc.openURL(`https://${url}`);
  };

  rightClick = event => {
    event.preventDefault();

    ipc.openEventMenu(
      {
        x: event.clientX,
        y: event.clientY
      },
      this.menuSpec
    );
  };

  getID() {
    const info = this.props.content;

    const props = [
      'payload.deletedUser.username',
      'payload.slug',
      'payload.aliasId',
      'payload.deploymentId'
    ];

    for (const prop of props) {
      const id = dotProp.get(info, prop);

      if (id) {
        return id;
      }
    }

    return null;
  }

  getDashboardURL() {
    const content = this.props.content;

    if (content.type !== 'deployment') {
      return null;
    }

    const { deploymentUrl, url } = content.payload;
    const host = deploymentUrl || url;

    return `https://zeit.co/deployments/${host}`;
  }

  componentWillMount() {
    const info = this.props.content;

    const urlProps = [
      'payload.cn',
      'payload.alias',
      'payload.url',
      'payload.domain',
      'payload.deploymentUrl'
    ];

    for (const prop of urlProps) {
      const url = dotProp.get(info, prop);

      if (url) {
        this.setState({ url });
        break;
      }
    }
  }

  componentDidMount() {
    const { url } = this.state;

    this.menuSpec = {
      url,
      id: this.getID(),
      dashboardUrl: this.getDashboardURL()
    };
  }

  parseDate(date) {
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
  }

  componentDidCatch(error, errorInfo) {
    console.error('Failed to handle event:', error);
    this.setState({ hasError: true });

    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const { message, content, team, group, darkMode } = this.props;
    const avatarHash = content.user && content.user.avatar;
    const classes = ['event'];

    if (darkMode) {
      classes.push('dark');
    }

    return (
      <figure
        className={classes.join(' ')}
        onClick={this.click}
        onContextMenu={this.rightClick}
      >
        <Avatar
          event={content}
          team={team}
          group={group}
          hash={avatarHash}
          darkMode={darkMode}
        />

        <figcaption>
          {message}
          <span>{this.parseDate(content.created)}</span>
        </figcaption>

        <style jsx>{`
          figure {
            margin: 0;
            display: flex;
            justify-content: space-between;
          }

          figure:hover {
            background: #f5f5f5;
          }

          figure.dark:hover {
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

          figure.dark figcaption {
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

          .event.dark p {
            color: #999;
          }

          .event p b {
            font-weight: normal;
            color: #000;
          }

          .event.dark p b {
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

          .event.dark p code {
            background: #333;
            color: #ccc;
          }

          .event:hover p code {
            background: #e8e8e8;
          }

          .event.dark:hover p code {
            background: #464646;
          }
        `}</style>
      </figure>
    );
  }
}

EventMessage.propTypes = {
  content: object,
  currentUser: object,
  team: object,
  setScopeWithSlug: func,
  message: object,
  group: string,
  darkMode: bool
};

export default EventMessage;
