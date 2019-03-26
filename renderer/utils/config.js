const path = require('path')
const { homedir } = require('os')
const fs = require('fs-extra')

const paths = {
  auth: '.now/auth.json',
  config: '.now/config.json'
}

for (const file in paths) {
  if (!{}.hasOwnProperty.call(paths, file)) {
    continue
  }

  paths[file] = path.join(homedir(), paths[file])
}

export default async () => {
  const content = {}
  let authContent = null
  let config = null

  try {
    authContent = await fs.readJSON(paths.auth)
    config = await fs.readJSON(paths.config)
  } catch (e) {}

  let token = null

  if (authContent) {
    if (authContent.credentials) {
      ;({ token } = authContent.credentials.find(
        item => item.provider === 'sh'
      ))
    } else {
      token = authContent.token
    }
  }

  const tokenProp = token ? { token } : {}

  if (config && config.sh) {
    const { sh, updateChannel, desktop } = config
    const isCanary = updateChannel && updateChannel === 'canary'

    if (isCanary) {
      content.updateChannel = 'canary'
    }

    if (desktop) {
      content.desktop = desktop
    }

    Object.assign(content, sh || {}, tokenProp)
  } else {
    Object.assign(content, config || {}, tokenProp)
  }

  if (typeof content.user === 'object') {
    content.user = content.user.uid || content.user.id
  }

  if (typeof content.currentTeam === 'object') {
    content.currentTeam = content.currentTeam.id
  }

  if (!content.token) {
    throw new Error('No user token defined')
  }

  return content
}
