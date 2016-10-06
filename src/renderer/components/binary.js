// Native
import {execSync} from 'child_process'

// Packages
import React from 'react'
import {remote} from 'electron'
import fs from 'fs-promise'
import compareVersion from 'compare-version'

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
    const comparision = compareVersion(remoteVersion, localVersion)

    if (comparision === 1) {
      return true
    }

    return false
  },
  async componentDidMount() {
    const binaryUtils = remote.getGlobal('binaryUtils')
    const binaryPath = binaryUtils.getPath() + '/now'

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
          <p>Please be so kind and leave the app open. We will let you know once we are done! Should not take too long.</p>
        </article>
      )
    }

    if (this.state.done) {
      return (
        <article>
          <p><strong>Hooray!</strong></p>
          <p>The binary successfully landed in <code>/usr/local/bin</code>.</p>
          <p>You can now use <code>now</code> from the command line.</p>
        </article>
      )
    }

    return (
      <article>
        <p>Bye the way: You can use <code>now</code> from the command line for more advanced features.</p>
        <p>Press the button below to place <code>now</code> in <code>/usr/local/bin</code>. In the future, we&#39;ll keep it updated for you automatically.</p>

        <a {...binaryButton}>{installText}</a>
      </article>
    )
  }
})
