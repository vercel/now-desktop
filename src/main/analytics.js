/* eslint-disable camelcase */

// Native
import os from 'os'

// Packages
import macAdress from 'macaddress'
import md5 from 'md5'
import mixpanel from 'mixpanel'
import fileSize from 'filesize'
import firstRun from 'first-run'
import Config from 'electron-config'

// Ours
import pkg from '../../app/package'

const getMacAddress = () => new Promise((resolve, reject) => {
  // Get unique identifier for the current system
  macAdress.one((err, mac) => {
    if (err) {
      reject(err)
      return
    }

    resolve(mac)
  })
})

const getEmailAddress = () => {
  const config = new Config()
  const identifier = 'now.user.email'

  if (!config.has(identifier)) {
    return false
  }

  return config.get(identifier)
}

const analytics = mixpanel.init(pkg.mixPanel.id, {
  protocol: 'https'
})

export const track = (handle, details = {}) => {
  if (!handle) {
    return
  }

  // Identify session
  details.distinct_id = process.env.MACHINE

  // Send event to MixPanel
  analytics.track(handle, details)
}

export const init = async () => {
  process.env.MACHINE = md5(await getMacAddress())

  const person = {
    Platform: os.type(),
    Memory: fileSize(os.totalmem()),
    Arch: os.arch()
  }

  const email = getEmailAddress()

  if (email) {
    person.$email = email
  }

  analytics.people.set(process.env.MACHINE, person)

  if (firstRun()) {
    track('App installed', {
      Version: pkg.version
    })
  }

  track('App booted')
}
