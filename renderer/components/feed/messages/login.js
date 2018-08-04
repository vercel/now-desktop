// Utilities
import parseUA from '../../../utils/user-agent'

// Components
import Message from './message'

const osNames = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux',
  freebsd: 'FreeBSD',
  sunos: 'SunOS',
  'Mac OS': 'macOS'
}

export default class Login extends Message {
  render() {
    const { event: { payload } } = this.props

    let { userAgent, geolocation } = payload
    userAgent = parseUA(userAgent)

    let from
    let os

    if (userAgent) {
      from = userAgent.browser
        ? userAgent.browser.name
        : userAgent.program ? 'Now CLI' : null
      os = userAgent.os ? osNames[userAgent.os.name] || userAgent.os.name : null
    } else {
      from = payload.env
      os = payload.os
    }

    if (userAgent.ua.includes('Electron/')) {
      from = 'Now Desktop'
    }

    let message = 'logged in'

    if (from) message += ` from ${from}`
    if (os) message += ` on ${os}`

    if (geolocation) {
      const city =
        typeof geolocation.city === 'object'
          ? geolocation.city.names.en
          : geolocation.city
      const region =
        typeof geolocation.most_specific_subdivision === 'object'
          ? geolocation.most_specific_subdivision.names.en
          : geolocation.regionName

      // Only output location if both city and region are specified
      if (!city || !region) {
        return (
          <p>
            <b>You</b> {message}
          </p>
        )
      }

      if (city === region) {
        message += ` in ${city}`
      } else {
        message += ` in ${city}, ${region}`
      }
    }

    return (
      <p>
        <b>You</b> {message}
      </p>
    )
  }
}
