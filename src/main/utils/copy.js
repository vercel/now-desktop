// Native
import path from 'path'

// Packages
import glob from 'glob-promise'
import fs from 'fs-promise'

// Ours
import {error as showError} from '../dialogs'
import injectPackage from './inject'

export default async (content, tmp, defaults) => {
  let items
  const copiers = new Set()

  try {
    items = await glob(path.join(content, '**'), {
      dot: true,
      strict: true,
      mark: true,
      ignore: [
        '**/node_modules/**',
        '**/.git/**'
      ]
    })
  } catch (err) {
    showError('Not able to walk directory for copying it', err)
    return
  }

  // The first item of the glob is the directory itself and we don't want to copy it.
  // Besides that, it causes a weird `operation not permited` error on Windows.
  items.shift()

  for (const item of items) {
    const target = path.join(tmp + '/content', path.relative(content, item))
    copiers.add(fs.copy(item, target))
  }

  try {
    await Promise.all(copiers)
  } catch (err) {}

  await injectPackage(tmp, defaults)
}
