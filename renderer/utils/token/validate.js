// Packages
import electron from 'electron'

export default async token => {
  const remote = electron.remote || false

  if (!remote) {
    return
  }

  const loadData = remote.require('./utils/data/load')
  const { API_USER } = remote.require('./utils/data/endpoints')

  try {
    await loadData(API_USER, token)
  } catch (err) {
    console.log('Token within .now.json is not valid')
    console.log('Just ignore the error above')

    return false
  }

  return true
}
