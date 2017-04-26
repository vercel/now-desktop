// Utilities
import remote from '../utils/electron'

export default type => {
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
