// Native
const path = require('path')

// Packages
const { clipboard, shell } = require('electron')
const fs = require('fs-promise')
const pathExists = require('path-exists')
const deglob = require('deglob')
const { isTextSync: isText } = require('istextorbinary')
const chalk = require('chalk')
const slash = require('slash')

// Ours
const { connector } = require('../../api')
const { error: showError } = require('../../dialogs')
const notify = require('../../notify')
const { get: getConfig } = require('../config')

const genTitle = deployment => {
  if (deployment.state === 'READY') {
    return 'Already deployed!'
  }

  return 'Deploying...'
}

const getContents = async dir => {
  let items

  try {
    items = await new Promise((resolve, reject) => {
      deglob(
        ['**'],
        {
          cwd: dir
        },
        (err, files) => {
          if (err) {
            reject(err)
            return
          }

          resolve(files)
        }
      )
    })
  } catch (err) {
    showError('Could not read directory to deploy', err)
    return
  }

  return items
}

const removeTempDir = async (dir, logStatus) => {
  try {
    await fs.remove(dir)
  } catch (err) {
    showError('Could not remove temporary directory', err)
    return
  }

  logStatus('Removed temporary directory')
}

const teamInScope = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    return false
  }

  if (config.currentTeam) {
    return config.currentTeam.id
  }

  return false
}

module.exports = async (folder, deploymentType) => {
  const details = {}
  const dir = path.resolve(folder)

  process.env.BUSYNESS = 'deploying'

  // Log separator
  if (deploymentType !== 'static') {
    console.log(chalk.grey('---'))
  }

  let projectName = 'docker project'

  const isNode = deploymentType === 'node' || deploymentType === 'static'
  const propertyName = isNode ? 'package' : 'package.json'

  if (isNode) {
    // Load the package file
    const pkgFile = path.join(dir, 'package.json')
    let packageJSON

    try {
      packageJSON = await fs.readJSON(pkgFile)
    } catch (err) {
      showError(
        'Could not parse `package.json` file. Please check it for syntax errors!',
        err
      )
      return
    }

    details[propertyName] = deploymentType === 'docker'
      ? JSON.stringify(packageJSON)
      : packageJSON
  }

  notify({
    title: 'Uploading Files...',
    body: 'Your files are being uploaded to now.'
  })

  if (isNode) {
    projectName = details[propertyName].name
  }

  const logStatus = message =>
    console.log(chalk.yellow(`[${projectName}]`) + ' ' + message)

  const items = await getContents(dir)
  let existing = []

  for (const itemPath of items) {
    existing.push(pathExists(itemPath))
  }

  try {
    existing = await Promise.all(existing)
  } catch (err) {
    showError('Not able to check if path exists', err)
    return
  }

  let readers = []

  for (let i = 0; i < existing.length; i++) {
    const exists = existing[i]
    const item = items[i]

    if (!exists) {
      continue
    }

    const relativePath = slash(path.relative(dir, item))

    if (relativePath === 'package.json') {
      continue
    }

    const reader = fs.readFile(item)
    readers.push(reader)
  }

  try {
    readers = await Promise.all(readers)
  } catch (err) {
    showError('Could not read file for deployment', err)
    return
  }

  for (let i = 0; i < readers.length; i++) {
    const file = readers[i]
    const filePath = items[i]

    const itemDetails = path.parse(filePath)
    const fileName = itemDetails.base
    const relativePath = slash(path.relative(dir, filePath))

    // Find out if the file is text-based or binary
    const fileIsText = isText(fileName, file)

    if (!fileIsText) {
      details[relativePath] = {
        binary: true,
        content: file.toString('base64')
      }

      continue
    }

    details[relativePath] = file.toString()
  }

  let deployment

  const apiSession = await connector()
  const team = await teamInScope()

  if (team) {
    details.teamId = team
  }

  try {
    deployment = await apiSession.createDeployment(details)
  } catch (err) {
    showError('Could not create deployment', err.toString())
    return
  }

  const url = `https://${deployment.host}`

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
        if (err.includes('404')) {
          clearInterval(checker)
          return
        }

        showError('Not able to get deployment', err)
        return
      }

      if (current.state === 'READY') {
        clearInterval(checker)

        process.env.BUSYNESS = 'ready'

        notify({
          title: 'Done Deploying!',
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
    title: genTitle(deployment),
    body: 'Your clipboard already contains the URL.',
    url
  })

  // Delete the local deployed directory if required
  if (deploymentType === 'static') {
    await removeTempDir(folder, logStatus)
  }
}
