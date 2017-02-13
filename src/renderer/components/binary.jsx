// Native
import {execSync} from 'child_process'

// Packages
import {remote} from 'electron'
import React from 'react'
import fs from 'fs-promise'
import semVer from 'semver'

// Ours
import installBinary from '../utils/load-binary'

export default React.createClass({
  getInitialState() {
    return {
      binaryInstalled: false,
      installing: false,
      done: false,
      downloading: false
    }
  },
  async isOlderThanLatest(utils, binaryPath) {
    let current

    try {
      current = await utils.getURL()
    } catch (err) {
      return
    }

    if (!current) {
      return
    }

    const remoteVersion = current.version

    let localVersion

    try {
      localVersion = execSync(binaryPath + ' -v').toString()
    } catch (err) {
      return
    }

    localVersion = String(localVersion.split(' ')[2])
    const comparision = semVer.compare(remoteVersion, localVersion)

    if (comparision === 1) {
      return true
    }

    return false
  },
  async componentDidMount() {
    const binaryUtils = remote.getGlobal('binaryUtils')
    const binaryPath = binaryUtils.getPath() + '/now' + binaryUtils.getBinarySuffix()

    let stat

    try {
      stat = await fs.lstat(binaryPath)
    } catch (err) {
      return
    }

    if (stat.isSymbolicLink()) {
      return
    }

    if (await this.isOlderThanLatest(binaryUtils, binaryPath)) {
      return
    }

    const currentWindow = remote.getCurrentWindow()
    currentWindow.focus()

    this.setState({
      binaryInstalled: true
    })
  },
  render() {
    const element = this

    let classes = 'button install'
    let installText = 'Install now'

    if (this.state.binaryInstalled) {
      classes += ' off'
      installText = 'Already installed'
    }

    const binaryButton = {
      className: classes,
      async onClick() {
        if (element.state.binaryInstalled) {
          return
        }

        await installBinary(element)
      }
    }

    if (this.state.installing) {
      const loadingText = this.state.downloading ? 'Downloading' : 'Installing'

      return (
        <article>
          <p className="install-status">
            <strong>{loadingText} the binary</strong>

            <i>.</i>
            <i>.</i>
            <i>.</i>
          </p>
          <p>Please be so kind and leave the app open! We&#39;ll let you know once we are done. This should not take too long.</p>
        </article>
      )
    }

    if (this.state.done) {
      return (
        <article>
          <p><strong>Hooray! 🎉</strong></p>
          <p>The binary successfully landed in its directory!</p>
          <p>You can now use <code>now</code> from the command line.</p>
        </article>
      )
    }

    return (
      <article>
        <p>In addition to this app, you can also use <code>now</code> from the command line, if you&#39;d like to.</p>
        <p>Press the button below to install it! When a new version gets released, we&#39;ll automatically update it for you.</p>

        <a {...binaryButton}>{installText}</a>
      </article>
    )
  }
})
