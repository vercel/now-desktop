import parseUA from '../../utils/user-agent';
import Message from './message';

const osNames = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux',
  freebsd: 'FreeBSD',
  sunos: 'SunOS',
  'Mac OS': 'macOS'
};

export default class Login extends Message {
  render() {
    const {
      event: { payload }
    } = this.props;
    let { userAgent, geolocation } = payload;

    userAgent = parseUA(userAgent);

    let from;
    let os;

    if (userAgent) {
      if (userAgent.ua && userAgent.ua.includes('Electron/')) {
        from = 'Now Desktop';
      } else {
        from = userAgent.browser
          ? userAgent.browser.name
          : userAgent.program
          ? 'Now CLI'
          : null;
      }

      os = osNames[userAgent.os.name] || userAgent.os.name;
    } else {
      from = payload.env;
      os = payload.os;
    }

    let message = 'logged in';
    if (from) message += ` from ${from}`;
    if (os) message += ` on ${os}`;

    if (geolocation) {
      const city =
        geolocation.city && typeof geolocation.city === 'object'
          ? geolocation.city.names
            ? geolocation.city.names.en
            : geolocation.city
          : geolocation.city;
      const region =
        geolocation.most_specific_subdivision &&
        typeof geolocation.most_specific_subdivision === 'object'
          ? geolocation.most_specific_subdivision.names.en
          : geolocation.regionName;
      if (city) {
        if (city === region) {
          message += ` in ${city}`;
        } else {
          message += ` in ${city}, ${region}`;
        }
      }
    }

    return (
      <p>
        <b>{this.getDisplayName()}</b> {message}
      </p>
    );
  }
}
