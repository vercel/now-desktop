// Utilities
import remote from '../utils/electron'

export const getCache = type => {
  if (!type) {
    return false
  }

  const { prepareCache } = remote.require('./api')
  const cache = prepareCache()

  if (!cache.has(type)) {
    return false
  }

  return cache.get(type)
}

export const getConfig = async () => {
  const { get } = remote.require('./utils/config')
  let details

  try {
    details = await get()
  } catch (err) {
    return false
  }

  return details
}
