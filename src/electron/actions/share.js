// Native
import path from 'path'

// Packages
import {tmpdir} from 'os'
import md5 from 'md5'
import dasherize from 'dasherize'
import fs from 'fs-promise'
import tmp from 'tmp-promise'
import retry from 'async-retry'
import chalk from 'chalk'
import pathExists from 'path-exists'

// Ours
import injectPackage from '../utils/inject'
import copyContents from '../utils/copy'
import {error as showError} from '../dialogs'

export default async item => {
  if (!await pathExists(item)) {
    showError('Path doesn\'t exist!')
    return
  }

  process.env.BUSYNESS = 'sharing'

  const uniqueIdentifier = md5(item)
  const itemName = path.parse(item).name

  const pkgDefaults = {
    name: dasherize(itemName),
    version: '1.0.0',
    scripts: {
      start: 'list ./content'
    },
    dependencies: {
      list: 'latest'
    }
  }

  const identifier = 'now-app-' + uniqueIdentifier

  const tmpDir = await retry(await tmp.dir({
    // We need to use the hased directory identifier
    // Because if we don't use the same id every time,
    // now won't update the existing deployment and create a new one instead
    name: identifier,

    // Keep it, because we'll remove it manually later
    keep: true
  }), {
    retries: 5,
    onRetry: async () => {
      const root = tmpdir()
      const created = path.join(root, identifier)

      try {
        await fs.remove(created)
      } catch (err) {
        showError('Could not rm temporary directory for creating new one', err)
      }
    }
  })

  // Log status of deployment
  console.log(chalk.grey('---'))
  console.log(chalk.yellow(`[${pkgDefaults.name}]`) + ' Created temporary directory for sharing')

  const details = await fs.lstat(item)

  if (details.isDirectory()) {
    await copyContents(item, tmpDir.path, pkgDefaults)
  } else if (details.isFile()) {
    const fileName = path.parse(item).base
    const target = path.join(tmpDir.path, '/content', fileName)

    try {
      await fs.copy(item, target)
    } catch (err) {
      showError('Not able to copy file to temporary directory', err)
      return
    }

    await injectPackage(tmpDir.path, pkgDefaults)
  } else {
    showError('Path is neither a file nor a directory!')
  }
}
