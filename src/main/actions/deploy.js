// Native
import path from 'path'
import fs from 'fs-promise'

// Packages
import pathExists from 'path-exists'
import glob from 'glob-promise'
import {dir as isDirectory} from 'path-type'
import {isTextSync as isText} from 'istextorbinary'
import {clipboard, shell, dialog} from 'electron'
import chalk from 'chalk'
import du from 'du'
import fileSize from 'filesize'

// Ours
import {connector} from '../api'
import {error as showError} from '../dialogs'
import notify from '../notify'

const getProjectType = (nodeReady, dockerReady) => {
  let projectType = 'docker'

  if (nodeReady && dockerReady) {
    const dialogAnswer = dialog.showMessageBox({
      type: 'question',
      message: 'Which File Should Be Preferred?',
      detail: 'Depending or your choice, the deployment will either be run in Docker or Node.',
      buttons: [
        'package.json',
        'Dockerfile'
      ]
    })

    if (!dialogAnswer) {
      projectType = 'node'
    }
  } else if (nodeReady) {
    projectType = 'node'
  }

  return projectType
}

const tooBig = async directory => new Promise(resolve => {
  const notAllowed = [
    '.DS_Store',
    'node_modules',
    'bower_components'
  ]

  const duOptions = {
    filter(item) {
      const relativePath = path.relative(directory, item)
      const parts = relativePath.split('/')

      for (const part of parts) {
        if (notAllowed.includes(part)) {
          return false
        }
      }

      return true
    }
  }

  du(directory, duOptions, (err, size) => {
    if (err) {
      console.error(err)
      return
    }

    const maxSize = 1000000 * 5

    if (size > maxSize) {
      resolve({
        maxSize,
        size
      })
    } else {
      resolve(false)
    }
  })
})

const sizeWarning = folderTooBig => {
  const difference = folderTooBig.size - folderTooBig.maxSize
  const readable = fileSize(difference)

  const warning = `Your project is ${readable} bigger than the currently allowed maximum size of 5 MB.`
  const hope = 'But don\'t worry! We\'ll update the app very soon to make it capable of handling these situations.'

  showError(warning + '\n\n' + hope)
}

const genTitle = (deployment, sharing) => {
  if (deployment.state === 'READY') {
    return 'Already deployed!'
  }

  return (sharing ? 'Sharing' : 'Deploying') + '...'
}

export default async (folder, sharing) => {
  const details = {}
  const folderTooBig = await tooBig(folder)

  if (folderTooBig) {
    sizeWarning(folderTooBig)
    return
  }

  process.env.BUSYNESS = 'deploying'

  const dir = path.resolve(folder)

  const pkgFile = path.join(dir, 'package.json')
  const dockerFile = path.join(dir, 'Dockerfile')

  const dockerReady = await pathExists(dockerFile)
  const nodeReady = await pathExists(pkgFile)

  // Ignore the project if there's no package file
  if (!nodeReady && !dockerReady) {
    showError('Not a valid project!')
    return
  }

  notify({
    title: 'Uploading files...',
    body: 'Your files are being uploaded to our servers.'
  })

  // Log separator
  if (!sharing) {
    console.log(chalk.grey('---'))
  }

  let projectName = 'docker project'

  const projectType = getProjectType(nodeReady, dockerReady)
  const propertyName = projectType === 'node' ? 'package' : 'package.json'

  if (nodeReady) {
    // Load the package file
    let packageJSON

    try {
      packageJSON = await fs.readJSON(pkgFile)
    } catch (err) {
      showError('Not able to load package file', err)
      return
    }

    details[propertyName] = projectType === 'docker' ? JSON.stringify(packageJSON) : packageJSON
  }

  if (projectType === 'node') {
    projectName = details[propertyName].name
  }

  const logStatus = message => console.log(chalk.yellow(`[${projectName}]`) + ' ' + message)

  let items

  try {
    items = await glob(path.join(dir, '**'), {
      dot: true,
      strict: true,
      recursive: true,
      mark: true,
      ignore: [
        '**/node_modules/**',
        '**/.git/**'
      ]
    })
  } catch (err) {
    showError('Could not read directory to deploy', err)
    return
  }

  for (const itemPath of items) {
    const itemDetails = path.parse(itemPath)
    const fileName = itemDetails.base
    const relativePath = path.relative(dir, itemPath)

    if (!await pathExists(itemPath)) {
      continue
    }

    let isDir

    try {
      isDir = await isDirectory(itemPath)
    } catch (err) {
      showError('Not able to test if item is a directory', err)
      return
    }

    if (!isDir && relativePath !== 'package.json') {
      let fileContent

      try {
        fileContent = await fs.readFile(itemPath)
      } catch (err) {
        showError('Could not read file for deployment', err)
        continue
      }

      // Find out if the file is text-based or binary
      const fileIsText = isText(fileName, fileContent)

      if (!fileIsText) {
        details[relativePath] = {
          binary: true,
          content: fileContent.toString('base64')
        }

        continue
      }

      details[relativePath] = fileContent.toString()
    }
  }

  let deployment
  const apiSession = connector()

  try {
    deployment = await apiSession.createDeployment(details)
  } catch (err) {
    showError('Could not create deployment', err.toString())
    return
  }

  const url = 'https://' + deployment.host

  if (deployment.state === 'READY') {
    // Open the URL in the default browser
    shell.openExternal(url)

    // Log the current state of the deployment
    logStatus(deployment.state)
  } else {
    // If the deployment isn't ready, regularly check for the state
    const checker = setInterval(async () => {
      let current

      try {
        current = await apiSession.getDeployment(deployment.uid)
      } catch (err) {
        showError('Not able to get deployment', err)
        return
      }

      if (current.state === 'READY') {
        clearInterval(checker)

        process.env.BUSYNESS = 'ready'

        notify({
          title: 'Done ' + (sharing ? 'sharing' : 'deploying') + '!',
          body: 'Opening the URL in your browser...',
          url
        })

        // Open the URL in the default browser
        shell.openExternal(url)
      }

      if (current.state === 'DELETED') {
        clearInterval(checker)
      }

      // Log the current state of the deployment
      logStatus(current.state)
    }, 3000)
  }

  // Copy deployment URL to clipboard
  clipboard.writeText(url)

  // Let the user now
  notify({
    title: genTitle(deployment, sharing),
    body: 'Your clipboard already contains the URL.',
    url
  })

  // Delete the local deployed directory if required
  if (sharing) {
    try {
      await fs.remove(folder)
    } catch (err) {
      showError('Could not remove temporary directory', err)
      return
    }

    logStatus('Removed temporary directory')
  }
}
