// Packages
import React from 'react'

// Components
import Message from '../message'

// Utilities
import parseUA from '../../../utils/user-agent'

const osNames = {
  darwin: 'Mac OS',
  win32: 'Windows',
  linux: 'Linux',
  freebsd: 'FreeBSD',
  sunos: 'SunOS'
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
        : userAgent.program ? 'CLI' : null
      os = osNames[userAgent.os.name] || userAgent.os.name
    } else {
      from = payload.env
      os = payload.os
    }

    let message = 'Logged in'
    if (from) message += ` from ${from}`
    if (os) message += ` (${os})`

    if (geolocation) {
      const city = typeof geolocation.city === 'object'
        ? geolocation.city.names.en
        : geolocation.city
      const region = typeof geolocation.most_specific_subdivision === 'object'
        ? geolocation.most_specific_subdivision.names.en
        : geolocation.regionName
      if (city === region) {
        message += ` in ${city}`
      } else {
        message += ` in ${city}, ${region}`
      }
    }

    return <span>{message}</span>
  }
}
